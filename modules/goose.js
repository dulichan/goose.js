/*
Routing mediator that enables REST-ful services
TODO :- How to handle multipart data
*/
var goose = (function () {
    var configs = {
        CONTEXT: "/"
    };
    // constructor
    var routes = new Array();
	var log = new Log();
    var module = function (conf) {
        mergeRecursive(configs, conf);
        log.info("Goose Context- " + configs.CONTEXT);
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
        route: function (route, action) {
            //contains VERB and the route
            routes.push({
                    route: routeOverload(route),
                    action: action
                });
        },
		get: function (route, action) {
            this.route(route + "|GET", action);
        },	
		post: function (route, action) {
            this.route(route + "|POST", action);
	    },
		put: function (route, action) {
            this.route(route + "|PUT", action);
	    },
        process: function (request) {
			log.info(routes);
            for (var i = 0; i < routes.length; i++) {
                var routeObject = routes[i];
                var routeAction = routeObject.action;
                var routeVariables = routeObject.route.split("|");
                var route = routeVariables[0];
                var verb = routeVariables[1];
                var uriMatcher = new URIMatcher(request.getRequestURI());
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
    };
    // return module
    return module;
})();