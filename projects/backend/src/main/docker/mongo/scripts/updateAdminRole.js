db = db.getSiblingDB('admin');

db.runCommand({ createRole: "evalAnyDatabase",
  privileges: [
    { resource: { anyResource: true }, actions: [ "anyAction" ] }
  ],
  roles: []
});

db.grantRolesToUser(
  "admin",
  [
    {
      role: "evalAnyDatabase", db: "admin"
    }
  ]
);