define([
    'jquery',
    'underscore',
    'backbone',
    'views/menuView',
    'views/locksView',
     'views/coursesView',
    'views/packagingView',

    'views/pageTitleView',
    'services/locksService',
    'services/packagingService',
    'services/coursesService',
    'utils/clientConfiguration',
    'models/locksPageModel',
    'models/siteModel',
    'models/packagingPageModel',
    'models/coursePageModel',
    'controllers/menuController',
    'controllers/locksController',
    'controllers/packagingController' ,
    'controllers/coursesController'

], function($, _, Backbone, MenuView, LocksView, CoursesView,  PackagingView, PageTitleView,
            LocksService, PackagingService, CoursesService, ClientConfiguration,
            LocksPageModel,  SiteModel,PackagingPageModel, CoursePageModel ,
            MenuController, LocksController, PackagingController, CoursesController) {
    var AppRouter = Backbone.Router.extend({
        routes: {
            '*actions': 'default'
        }
    });

    var initialize = function () {

        var router = new AppRouter();


        // Set up locks MVC components
        var locksPageModel = new LocksPageModel("Locks", "locks");
        var locksView = new LocksView();
        locksPageModel.addObserver(locksView);
        var locksController = new LocksController(locksPageModel, locksView);

        //Set up packaging MVC components
        var packagingPageModel = new PackagingPageModel("Packaging", "packaging");
        var packagingView = new PackagingView();
        packagingPageModel.addObserver(packagingView);
        var packagingController = new PackagingController(packagingPageModel, packagingView);


        var coursePageModel = new CoursePageModel("Courses", "courses");
        var coursesView = new CoursesView();
        coursePageModel.addObserver(coursesView);
        var coursesController = new CoursesController(coursePageModel,coursesView)

        //Set up a site model
        var siteModel = new SiteModel();
        siteModel.addPage(coursePageModel);
        siteModel.addPage(locksPageModel);
        siteModel.addPage(packagingPageModel);


        // Add a simple listener to site model that will update the
        // route in the browsers URL bar when page changes
        siteModel.addObserver({
            update : function (siteModel, updateType) {
                if (updateType === SiteModel.PAGE_UPDATED) {
                    router.navigate(siteModel.getCurrentPage().getRoute());
                }
            }
        });

        // Set up menu MVC components
        var menuView = new MenuView();
        siteModel.addObserver(menuView);
        var menuController = new MenuController(siteModel, menuView);

        var pageTitleView = new PageTitleView();
        siteModel.addObserver(pageTitleView);

        // Set up title MVC (no controller needed because no interaction exists)

        //Initilize services
        LocksService.initialize(ClientConfiguration.getRestBasePath(),
            ClientConfiguration.getPublisherAccountId());
        PackagingService.initialize(ClientConfiguration.getRestBasePath(),
            ClientConfiguration.getPublisherAccountId());
        CoursesService.initialize(ClientConfiguration.getRestBasePath(),
            ClientConfiguration.getPublisherAccountId());


        //Define actions for the diffrent routes
        router.on('route:default', function (route) {
            if (siteModel.hasPageWithRoute(route)) {
                siteModel.setCurrentPageByRoute(route);
            } else {
                var defaultRoute = siteModel.getDefaultPage().getRoute();
                siteModel.setCurrentPageByRoute(defaultRoute);
            }
        });

        // Start Backbone history a necessary step for bookmarkable URL's
        Backbone.history.start();
    };

    return {
        initialize: initialize
    };
});
