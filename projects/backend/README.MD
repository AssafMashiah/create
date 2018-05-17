The backend project is following a clean architecture design.

The application is centered around *domain* core, which contains the *model*
and *usecases*. These define the interfaces for the services and 
persistence layers.

The application plain java services are wired-up to the application 
spring context in the @Configuration classes inside the config
package.

Persistence is split in dao objects and spring repository interfaces .
