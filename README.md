# BOT LINE@ messaging
 Minor FoodIT is own project

# Test Local
 set NODE_ENV=development

# AWS
 Dev host : https://ndev.1112delivery.com
 Prod host : https://n.1112delivery.com
 Host time zone use as UTC
 
# Repository
 https://github.com/minorgroup/MFG-DQ-LINE-BOT
  
# Application Flow
 * Site seting keep group key on redis and site row into mysql
 * Look up site will find key first then after use at mysql   
  
# Feature
 * version 1.0.0
      * Order route and controller
      * Line route and webhook controller
      * Cache data object in mongo database (In memory)
      * Scheme 
         * Store - keep {site ,groupId}
         * Order - keep order delivery data 
      * File storage
         * ./stores/  ,keep each store metadata
         * ./orders/  ,keep transaction data daily 
      * Swagger API document

 * version 1.0.1
      * Future order
        * Keep order transaction as files by date and site
        * (removed) Cache order transaction daily 
            * Filter out older than today
        * Keep future order for notification on promise date and before N minutes to due time (configurable)  
        * Print all 1112delivery order to console with tag of [incomming_order] 
        * Redis to store line group to siteId
        * Cleaning job
        
 * version 1.1
      * Remove write order to files 
      * Connect mysql database (db name has been changed on env)
            Table sites ,orders
      * Trigger cleaning order history in-memory
      * Every N minutes push carousel message contains last sent orders to admin group
      * Use carsousel flex message to represent receipt which has much more items detail for content flex message
  
  * version 1.1.2 
      * Release on 20190501
      * On startup overwrite cached key of store groupid on redis got result from database query of sites table  
      * Able mail to who is admin for monitoring data which message could not be send to LINE (happen error code on pushing message)   
      
  * version 1.2.0
      * Add clearing history order about cached data in past 90 days
      * Fix missing local time zone as one displayed for message monitoring shown as UTC
      * Add a new route to show order alerted
      * Can clear history unalerted via api
  * version 1.2.1
      * Add comps as displayed discount
      * Show the store name
  * version 1.2.2
      * Add one job for database clearing every 30th day of month
      * Removed subtotal and vat as displaying on message