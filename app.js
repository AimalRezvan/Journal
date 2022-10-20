const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
console.log(__dirname+"/public");

mongoose.connect("mongodb://localhost:27017/writingJournalDb", function(err){
  if(!err){
    console.log("connected to the database");
  }
});

const topicSchema = new mongoose.Schema({
  title: String,
  content: String
});

const Topic = mongoose.model("Topic", topicSchema);

const catagoySchema = new mongoose.Schema({
  name: String,
  topicList: [topicSchema]
})

const Catagory = mongoose.model("Catagory", catagoySchema);

const topic1 = new Topic({
  title: "duality",
  content: "there is a duality in mind which one part of us want one thing and the other one wants the opposite"
})


const psychology = Catagory({
  name: "psychology",
  topicList: [topic1]
});



app.get("/", function(req, res){
  Catagory.find({}, function(err, catagoryList){
    res.render("home", {catagories: catagoryList});
  });

  
});

app.get("/allCatagories", function(req, res){
  Catagory.find({}, function(err, catagoryList){
    res.render("AllCatagories", {catagories: catagoryList});
  })
});


app.get("/:catagoryName-:topicName", function(req, res){
  const catagoryName = req.params.catagoryName;
  const topicName = req.params.topicName;

  Catagory.findOne({name: catagoryName}, function(err, foundCat){
    if(!err){
      if (topicName == "+page"){
        res.render("catagories", {catagory: foundCat});
      }else{

        for (let i=0; i<foundCat.topicList.length; i++){
          if (foundCat.topicList[i].title==topicName){
            res.render("topic", {theTopic: foundCat.topicList[i], catagory: catagoryName});
            break;
          }
        }
      }
    }
  })

})

app.get("/edit!:catName!:topicName", function(req, res){
  catName = req.params.catName;
  topicName = req.params.topicName;
  console.log(catName, topicName);

  Catagory.findOne({name: catName}, function(err, foundCat){
    for (let i=0; i<foundCat.topicList.length; i++){
      if (foundCat.topicList[i].title==topicName){
        res.render("edit", {topic: foundCat.topicList[i], catagory: foundCat.name});
      }
    }
  })
});

app.get("/delete/:catName-:topicName", function(req, res){
  catName = req.params.catName;
  topicName = req.params.topicName;

  Catagory.findOne({name: catName}, function(err, foundCat){
    for( let i=0; i<foundCat.topicList.length; i++){
      if (foundCat.topicList[i].title == topicName){
        foundCat.topicList.splice(i, 1);
        foundCat.save();
        Catagory.find({}, function(err, foundCats){
          res.redirect("/")
        });
        
      }
    }
  })
});
  

app.get("/newTopic", function(req, res){
  res.render("newTopic", {errorText: ""});
})

app.post("/save!:catagory-:topicName", function(req, res){
  let catagory = req.params.catagory;
  let topicName = req.params.topicName;
  let topicText = req.body.content;

  Catagory.findOne({name: catagory}, function(err, foundCat){
    for( let i=0; i<foundCat.topicList.length; i++){
      if( foundCat.topicList[i].title == topicName){
        foundCat.topicList[i].content = topicText;
        foundCat.save();
        res.render("topic", {theTopic: foundCat.topicList[i], catagory: foundCat.name})
        break;
      }
    }
  })

})

app.post("/newTopic", function(req, res){
  let catagory = req.body.catagory;
  let title = req.body.title;
  let content = req.body.content;
  let topic = new Topic({
    title: title,
    content: content
  });
  
  Catagory.findOne({name: catagory}, function(err, foundCat){
    if(foundCat==null){
      newCat = new Catagory({
        name: catagory,
        topicList: [topic]
      });
      newCat.save();
      res.render("topic", {theTopic: topic, catagory: catagory});
    }else{
      if (isDuplicate(foundCat, title)){
        res.render("newTopic", {errorText: "There is a duplicate to this title!"});
      }else{

        foundCat.topicList.push(topic);
        foundCat.save();

        res.render("topic", {theTopic: topic, catagory:catagory});
      }
    }
  })
});

//returns if a topic is duplicate or not.
function isDuplicate(cat, title){
  for( let i=0; i<cat.topicList.length; i++){
    if(cat.topicList[i].title == title){
      return true;
    }
  }
  return false;
}



app.listen(3000, function(){
  console.log("the server is running on port 3000");
})
