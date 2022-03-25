const {MongoClient} = require('mongodb');

async function main(){

    const uri = "mongodb+srv://root:12345@cluster0.amtbq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

    const client = new MongoClient(uri);

    try {
        await client.connect();
        // await listDatabases(client);

        // await createListing(client,{
        //     name:"Bhoot ka Adda",
        //     summary:"Haunted House to enjoy with your friends & family",
        //     bedroom:6
        // })
        
        // await createMultipleListing(client,[
        //     {
        //         name:"Himigiri Homestay",
        //         summary:"Beautiful House located in Himalayas ",
        //         bedroom:6
        //     },
        //     {
        //         name:"Staycat",
        //         summary:"Perfect Location for staycation & remote Work",
        //         bedroom:10
        //     }
        // ])

        // await findOneListingByName(client,"StayDcat");

        // await findListingbyBedroom(client,{
        //     min_bathroom:2,
        //     min_bedroom:4,
        //     max_results:5
        // });

        // await updateListingByName(client,"Staycat","StayDoCat");

        // await upsertListing(client,"Ghar",{name:"Godzilla Home"});
        
        // await updateAllByProperty(client);

        // await deleteByName(client,"Staycat");

       await  deleteListingScrapedBeforeData(client,new Date("2019-02-15"));

    } catch (e) {
        console.error(e);
    }finally{
        await client.close();
    }

}

main().catch(console.error);

async function listDatabases(client){
    
    const databaseList  = await client.db().admin().listDatabases();

    console.log("Databases:");
    databaseList.databases.forEach(db=>{
        console.log(`${db.name}`)
    })
}

async function createListing(client,newListing){
    const listCreated =   await client.db("sample_airbnb").collection("listingsAndReviews").insertOne(newListing);
    console.log("New Listing Created:",listCreated);
}

async function createMultipleListing(client,newListing){
    const listCreated = await client.db("sample_airbnb").collection("listingsAndReviews").insertMany(newListing);
    console.log("Multiple Listing:",listCreated)
}

async function findOneListingByName(client,listing){
  const result =  await client.db("sample_airbnb").collection("listingsAndReviews").findOne({name:listing});
  console.log(result);
}

async function findListingbyBedroom(client,{
    min_bedroom = 0,
    min_bathroom = 0,
    max_results = Number.MAX_SAFE_INTEGER
}={}){
    const cursor =  client.db("sample_airbnb").collection("listingsAndReviews").find({
        bedrooms:{$gte:min_bedroom},
        bathrooms:{$gte:min_bathroom}
    }).sort({last_review:-1}).limit(5);

    const result = await cursor.toArray();
    console.log(result)
}

async function updateListingByName(client,oldName,newName){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateOne({name:oldName},{$set:newName});
    console.log(result);
}

async function upsertListing(client,oldName,newName){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateOne({name:oldName},{$set:newName},{upsert:true});
    (result.upsertCount>0)?(console.log("One Document(s) updated")):console.log("Update the previous available entry");
}

async function updateAllByProperty(client){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateMany({property_type:{$exists:false}},{$set:{property_type:"UNKNOWN"}})

    console.log(result.matchedCount);
    console.log(result.modifiedCount);
}

async function deleteByName(client,nameofListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").deleteOne({name:nameofListing});
    console.log(result.deletedCount);
}

async function deleteListingScrapedBeforeData(client,data){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").deleteMany({"last_scraped":{$lt:data}});
    console.log(result.deletedCount);
}