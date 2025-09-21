const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3");
const {open} = require("sqlite");
const path = require("path");
const { request } = require("http");


const app = express();
const port = 3000;



app.use(cors());
app.use(express.json());

// DB PATH

const dbPath = path.join(__dirname, "customerManagement.db");



let db = null; 



const initializeDBAndServer = async() => {
   try{
     db = await open({
        filename:dbPath,
        driver:sqlite3.Database
    });
   }catch (e){
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
   }
};


initializeDBAndServer();



// POST CREATE CUSTOMERS 

app.post("/api/customers", async (request, response) => {
    
    const customersDeatails = request.body;
    const {first_name, last_name, phone_number} = customersDeatails

    const addCustomerQuery = `
    INSERT INTO  
      
      customers (first_name, last_name, phone_number)

       VALUES ( '${first_name}', '${last_name}', '${phone_number}');`;

       const dbResponse = await db.run(addCustomerQuery);

       const customerId = dbResponse.lastID;
       response.send({customerId:customerId});


});


// GET API ALL CUSTOMERS   searching, sorting, and pagination.



app.get("/api/customers", async(request, response)=> {

    const getCustomersQuery = `
    SELECT 
      * 
    FROM 
    customers 
    ORDER BY 
      id
    `;

    const customersArray = await db.all(getCustomersQuery);
    response.send(customersArray)

});




//  Get details for a single customer 

app.get("/api/customers/:id", async (request, response) => {
     
    const {id} = request.params 
    const getCustomerQuery = `
    SELECT 
      *
    FROM 

    customers 

    WHERE 
     
     id = ${id};`;


const customer = await db.get(getCustomerQuery);
 
response.send(customer);


});



//  PUT   Update a customer's information.

app.put("/api/customers/:id",async(request,response) => {
    const {id} = request.params; 

    const customerDetails = request.body; 

    const {first_name, last_name, phone_number} = customerDetails;

    const updateCustomerQuery = `
    
    UPDATE  
      customers 
      SET
      first_name = '${first_name}',
      last_name = '${last_name}',
      phone_number = '${phone_number}'
      WHERE 
        id = ${id}`;

     await db.run(updateCustomerQuery);

     response.send("Customer Update Successfully");

});


//    Delete a customer


app.delete("/api/customers/:id", async(request, response) => {
    const {id} = request.params
   
    const deleteCustomerQuery = `
    
    DELETE 
      FROM 
    customers 
    WHERE 
      id = ${id};`;

    await db.run(deleteCustomerQuery);

     response.send("Customer Delete Successfully");



});

// Address 

// Add a new address for a specific customer. 

app.post("/api/customers/:id/addresses", async (request,response) => {
    const {id} = request.params
  
    const {address_details, city, state, pin_code} = request.body
    
    const addAddressQuery = `
    
    INSERT INTO addresses(customer_id, address_details, city, state, pin_code)

        VALUES ( '${id}','${address_details}', '${city}', '${state}', '${pin_code}');`;

   const dbResponse  = await db.run(addAddressQuery);
     const addressId = dbResponse.lastID;
     response.send({addressId:addressId});


});


// Get all addresses for a specific customer. 



app.get("/api/customers/:id/addresses", async (request, response) => {
    const {id} = request.params; 

    const getAddressQuery = ` 
    SELECT * 
    FROM 
      addresses 
       WHERE 
        customer_id = ${id}
        ORDER BY 
          id`;


const addresses = await db.all(getAddressQuery);
response.send({addresses:addresses})



});



// Update a specific address. 



app.put("/api/addresses/:addressId", async(request, response) => {
    const {addressId} = request.params; 
   const {address_details, city, state, pin_code} = request.body;
    const updateAddressQuery = `
       UPDATE addresses 
       SET 
         
       address_details = '${address_details}',
       city = '${city}',
       state = '${state}',
       pin_code = '${pin_code}' 

       WHERE 
          id = ${addressId}`;

       await db.run(updateAddressQuery)
       
       response.send("Address Updated Successfully");

});



//  Delete a specific address. 




app.delete("/api/addresses/:addressId", async(request, response) => {

    const {addressId}= request.params;

    const deleteAddressQuery = `
    
    DELETE
    FROM 
    addresses 
    WHERE 
        id = ${addressId};`;

     
        await db.run(deleteAddressQuery);

        response.send("Address Delete Successfully")



});


app.listen(port, () => {
  console.log(`server start  on http://localhost:${port}`)
});