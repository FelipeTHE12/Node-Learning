const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

const itemSchema = new mongoose.Schema({
    name: {
        type: String, required:[true, "Need a name for the item"]
    }
});

const Item = mongoose.model("Items", itemSchema);

const startItem = new Item ({
    name: "Welcome !"
});

const startItemTwo = new Item ({
    name: "Add your new tasks"
});

const startItemThree = new Item ({
    name: " <= To delete use the checkbox"
});




const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

const defaultItems = [startItem, startItemTwo, startItemThree];

app.get("/", function(req, res){


    Item.find({}, function (err, foundItems) {

        if(foundItems.length === 0){
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                }else{
                    console.log("INSERT with sucess!!");
                }
             });
             res.redirect("/");
        }else{
            console.log("Items achados:")
            console.log(foundItems);
            res.render("list", {listDay: "Today", newItems: foundItems}); 
        }
    }
);     
});

app.get("/:customListName", function(req, res){

    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name: customListName}, function(err, listFound){
    if (!err){
        if(listFound){
            //Show existing lists on DB
            console.log("exists!");
            res.render("list", {listDay: listFound.name, newItems: listFound.items});
        }else{
            //Create a new list
            const list = new List({
                name: customListName,
                items: defaultItems
            });
            list.save();
            console.log("not exists");        
            res.redirect("/" + customListName);
        }
    }

});





});  

app.post("/", function(req, res){
    
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const newItem = new Item({
        name: itemName
    });

    if (listName === "Today") {
        newItem.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName}, function(err, resultList){
            resultList.items.push(newItem);
            resultList.save();
            res.redirect("/" + listName);
        });
    }
});

app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "today"){
        Item.findByIdAndDelete(checkedItemId, function (err) {
            if (!err){
                console.log("Deleted the item with sucess");
                res.redirect("/");
            }
        });
    }
    else{
        List.findOneAndUpdate({name: listName}, {$pull: {items:{_id: checkedItemId}}}, function(err, foundItems){
            if (!err){
                res.redirect("/" + listName);
            }
        });
    }

});

app.get("/about", function (req, res) {
    res.render("about");
})


app.listen(3000, function(){
    console.log("Server started on port 3000");
});