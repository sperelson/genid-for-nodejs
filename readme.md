# GenID.js
This is a Node.js application that generates a unique numeric ID.
It uses the time in microseconds, the unique instance ID of this server
and a counter to cater for sub-millisecond accesses. These are joined
to form a value that is passed back in json format.

It is similar in concept to Twitter's Snowflake project. Just a lot less code 
and more limitations. It only handles 16 application instances (starting at 
0) and only copes with 256 iterations within a single millisecond with 
rollover protection.

It can generate just over 6000 IDs/second on my 13" Macbook Pro.

## Missing functionality
The unique instance ID is hard-coded. It is trivial to pass through an ID 
as a startup argument and then initialize the id variable to this value:

    var id = process.argv[2];

However, a better approach would be to allow the application to call a
service to obtain its unique instance ID. This service would track the 
IP address of the calling application and would allocate an ID to the 
service. This could be implemented in many ways. This assumes you have
a single instance of this application running on an IP address.

Another limitation is Javascript's handling of large numbers. The reason
the instance ID is restricted to the number 15 and the sequence counter to 
the number 256 is that shifting the timestamp too many bits left causes an 
overflow. It is possible that the timestamp may become too large and cause 
this overflow to occur even with the currently imposed limits.  This will
happen around the year 2079. If you adjust the starting epoch you could
get around 69 years of reliable use.

One more limitation is that the date and times on each server running an
instance of this application must be synchronized and accurate for the 
ordering of generated ID values to work well.