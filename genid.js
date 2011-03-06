/* 
GenID.js
--------
This is a Node.js application that generates a unique numeric ID.
It uses the time in microseconds, the unique instance ID of this server
and a counter to cater for sub-millisecond accesses. These are joined
to form a value that is passed back in json format.

It is similar in concept to Twitter's Snowflake project. Just a lot less code 
and more limitations. It only handles 16 application instances (starting at 
0) and only copes with 256 iterations within a single millisecond with 
rollover protection.

Missing functionality
---------------------
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

Licensed with the MIT license
-----------------------------
Copyright (c) 2011 Stephen Perelson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var url = require('url');
var counter = 0;
var millisOld = 0;
var id = 1;
var protectRollover = false;
var http = require('http');

function createKey(req, res)
{
	protectRollover = false;
	// 01 Jan 2010 is a good epoch. Use
	// 		Date.UTC(2010,0,1)
	// to get this number (1262304000000)
	var millis = new Date().getTime() - 1262304000000;
	if (millisOld == millis) {
		counter++;
		// Rollover protection
		if (counter == 255)
		{
			protectRollover = true;
			counter = 0;
			setTimeout(function () {
  				createKey(req, res);
			}, 1);
		}
	} else {
		millisOld = millis;
		counter = 0;
	}
	if (protectRollover == false)
	{
		millis = millis * Math.pow(2, 12);
		var id2 = id * Math.pow(2, 8);
		var uid = millis + id2 + counter;
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.end('{"id":"' + uid + ' ' + Date.UTC(2079, 2, 1) +'"}\n');
	}
}

http.createServer(function (req, res) {
	createKey(req, res);
}).listen(process.env.PORT || 8543);
