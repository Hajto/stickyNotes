package controllers

import play.api._
import play.api.libs.json._
import play.modules.reactivemongo.json.BSONFormats._
import play.api.libs.json.Json.JsValueWrapper
import play.api.mvc._
import play.modules.reactivemongo.MongoController
import play.modules.reactivemongo.json.collection.JSONCollection
import play.twirl.api.Html
import reactivemongo.api.Cursor
import reactivemongo.bson.BSONObjectID
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

import scala.io.Source

object Application extends Controller with MongoController {

  def $(a: (String, JsValueWrapper)*) = Json.obj(a: _*)
  val idReads : Reads[String] = (JsPath \ "_id").read[String]

  def collection(repo: String): JSONCollection = db.collection[JSONCollection](repo)
  def stats : JSONCollection = db.collection[JSONCollection]("super-uber-ille")

  def index = htmlVendor("repo")


  def htmlVendor(repo: String) = Action.async {
    val cursor: Cursor[JsObject] = stats.find($("name" -> repo)).cursor[JsObject]
    val futureSlavesList: Future[List[JsObject]] = cursor.collect[List]()
    futureSlavesList.map { pins =>
      println(pins)
      if(pins.nonEmpty){
        println(pins.head)
        Ok(views.html.index(repo, Html(Json.toJson(pins.head).toString())))
      } else {
        Ok(views.html.index(repo, Html("{}")))
      }
    }
  }

  def create(repo: String) = Action.async(parse.json) { implicit req =>
    val id = BSONObjectID.generate
    collection(repo).insert($("_id" -> id) ++ req.body.as[JsObject]).map { last =>
      if(last.ok){
        stats.update($("name" -> repo),$("$inc" -> $("created" -> 1)),upsert=true).map{ last =>
          println(last.ok)
        }
        Ok(Json.toJson($("_id"->id) ++ $("success"->true)))
      }
      else
        BadRequest($("success"->false))
    }
  }

  def selectAll(repo: String) = Action.async {
    val cursor: Cursor[JsObject] = db.collection[JSONCollection](repo).find(Json.obj()).cursor[JsObject]
    val futureSlavesList: Future[List[JsObject]] = cursor.collect[List]()
    futureSlavesList.map { pins =>
      Ok(Json.toJson(pins))
    }
  }

  def delete(repo: String) = Action.async(parse.json) { implicit req =>
    req.body.validate[String](idReads).map{ id =>
      println(id)
      collection(repo).remove($("_id" -> BSONObjectID(id))).map {last =>
        if(last.ok){
          stats.update($("name" -> repo),$("$inc" -> $("deleted" -> 1)),upsert=true).map{ last =>
            println(last.ok)
          }
          Ok($("success"->last.ok))
        } else
          BadRequest("BadJson")}
    } getOrElse { Future.successful(BadRequest($("BadJson"->req.body)))}
  }

  def update(repo: String) = Action.async(parse.json) { implicit req =>
    req.body.validate[String](idReads).map{ id =>
      val newValues = req.body.as[JsObject] - "_id"
      collection(repo).update($("_id" -> BSONObjectID(id)),$("$set" -> newValues)).map { _=> Ok("Success")}
    } getOrElse { Future.successful(BadRequest("BadJSon"))}
  }

}