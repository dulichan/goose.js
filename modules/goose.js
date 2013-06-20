/*
Routing mediator that enables REST-ful services
TODO :- How to handle multipart data
*/
var goose = (function () {
    var configs = {
        CONTEXT: "/",
		CACHE:false,
		CACHE_REFRESH:false
    };
    // constructor
	// Will be using a hash rather than an array
    var routes = {};
	var log = new Log();
    var module = function (conf) {
        mergeRecursive(configs, conf);
        log.info("Goose Context- " + configs.CONTEXT);
		if(configs.CACHE){
			var r = application.get("jaggery.goose.routes");
			if(r==undefined){
				application.put("jaggery.goose.routes",routes);
			}else{
				routes=r;
			}
			route("cacherefresh",function(ctx){
				application.put("jaggery.goose.routes", undefined);
			}, "GET");
		}
    };

    function routeOverload(route) {
        return configs.CONTEXT + route;
    }

    function mergeRecursive(obj1, obj2) {
        for (var p in obj2) {
            try {
                // Property in destination object set; update its value.
                if (obj2[p].constructor == Object) {
                    obj1[p] = MergeRecursive(obj1[p], obj2[p]);
                } else {
                    obj1[p] = obj2[p];
                }
            } catch (e) {
                // Property in destination object not set; create it and set its value.
                obj1[p] = obj2[p];
            }
        }
        return obj1;
    }
	
    // prototype
    module.prototype = {
        constructor: module,
        route: function (route, action ,verb) {
            //contains VERB and the route
			if(configs.CACHE){
				if(routes[routeOverload(route+"|"+verb)]==undefined){
					routes[routeOverload(route+"|"+verb)] = {route:routeOverload(route),verb:verb,action:action};
					log.info("--------Goose CACHE enabled --------" + verb);
				}
				return;
			}
			log.info("sdfsd");
			routes[routeOverload(route+"|"+verb)] = {route:route,verb:verb,action:action};
        },
		get: function (route, action) {
            this.route(route, action, "GET");
        },	
		post: function (route, action) {
            this.route(route, action, "POST");
	    },
		put: function (route, action) {
            this.route(route, action, "PUT");
	    },
        process: function (request) {
			for (var property in routes){
				if(routes.hasOwnProperty(property)){
					var routeObject = routes[property];
					log.info(routeObject);
	                var routeAction = routeObject.action;
	                var route = routeObject.route;
	                var verb = routeObject.verb;
	                var uriMatcher = new URIMatcher(request.getRequestURI());
					log.info(request.getRequestURI());
	                if (uriMatcher.match(route)) {
	                    log.info('--------Goose Match--------');
	                }
	                if (uriMatcher.match(route) && request.getMethod() == verb) {
	                    var elements = uriMatcher.elements();
	                    var ctx = elements;
	                    log.info("--------Goose Verb --------" + verb);
	                    log.info("--------Goose Route --------" + route);
						log.info("--------Goose Elements --------");
						log.info(elements);
						
						var jResult = {};
						if(verb=="GET"){
							jResult = request.getAllParameters();
						}else{
							jResult = request.getAllParameters();
							if(request.getContentType()=='application/json'){
								mergeRecursive(jResult,request.getContent());	
							}
						}
						log.info("--------Goose file parsing--------- ");
						ctx.files = request.getAllFiles();
						
						log.info("--------Goose parsed data--------- ");
						log.info(jResult);
	                    ctx = mergeRecursive(jResult,ctx);
	
						log.info("--------Goose final data--------- ");
						log.info(jResult);
	                    routeAction(ctx);
	                    break;
	                }
				}
			}
            for (var i = 0; i < routes.length; i++) {
                
            }
        }
    };
    // return module
    return module;
})();