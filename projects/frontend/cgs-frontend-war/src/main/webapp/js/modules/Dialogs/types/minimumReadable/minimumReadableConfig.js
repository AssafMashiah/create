define( [] , function(){
    return {
        defaults: {
            "platform": "pc" ,
            "mode": "inBrowser"
        } ,
        platforms: [
            {
                "title": "Tablet",
                "id": "tablet",
                "style" : "tablet-icon",
                "hasResolutions" : true,
                "modes" : {
                    "galaxy" : {
                        "type" : "galaxy"
                    }
                } ,
                "resolutions": [
                    {
                        "name": "Apple iPad 1-3/mini" ,
                        "description": "1024x768" ,
                        "values": [ "1024" , "668" ]
                    },
                    {
                        "name": "Samsung Galaxy Tab 7\"" ,
                        "description": "1024x600" ,
                        "values": [ "1024" , "500" ] ,
                        "modes" : {
                            "galaxy" : [ 0 , 48 ]
                        }
                    },
                    {
                        "name": "Samsung Galaxy Tab 8\"" ,
                        "description": "1280x800" ,
                        "values": [ "1280" , "700" ] ,
                        "modes" : {
                            "galaxy" : [ 0 , 48 ]
                        }
                    },
                    {
                        "name": "Samsung Galaxy Tab 10.1\"" ,
                        "description": "1280x800" ,
                        "values": [ "1280" , "700" ] ,
                        "modes" : {
                            "galaxy" : [ 0 , 48 ]
                        }
                    }
                ],
                "default": {
                    "name": "Samsung Galaxy Tab 10.1\"" ,
                    "description": "1280x800" ,
                    "values": [ "1280" , "700" ] ,
                    "modes" : {
                        "galaxy" : [ 0 , 48 ]
                    }
                }
            },
            {
                "title": "PC" ,
                "id": "pc",
                "style" : "pc-icon",
                "isMode" : true ,
                "hasResolutions" : true,
                "modes" : [
                    {
                        "type" : "inBrowser",
                        "title" : "In Browser"
                    },
                    {
                        "type" : "fullScreen",
                        "title" : "Full Screen"
                    }
                ],
                "resolutions": [
                    {
                        "name": "10\" Netbook" ,
                        "description": "1024x600" ,
                        "modes" : {
                            "inBrowser" : [ "12" , "127" ],
                            "fullScreen" : [ 0 , 0 ]
                        },
                        "values": [ "1024" , "500" ]
                    },
                    {
                        "name": "12\" Netbook" ,
                        "description": "1024x768" ,
                        "modes" : {
                            "inBrowser" : [ "12" , "127" ],
                            "fullScreen" : [ 0 , 0 ]
                        },
                        "values": [ "1024" , "668" ]
                    },
                    {
                        "name": "13\" Notebook" ,
                        "description": "1280x800" ,
                        "modes" : {
                            "inBrowser" : [ "12" , "127" ],
                            "fullScreen" : [ 0 , 0 ]
                        },
                        "values": [ "1280" , "700" ]
                    },
                    {
                        "name": "15\" Notebook" ,
                        "description": "1366x768" ,
                        "modes" : {
                            "inBrowser" : [ "12" , "127" ],
                            "fullScreen" : [ 0 , 0 ]
                        },
                        "values": [ "1366" , "668" ]
                    },
                    {
                        "name": "19\" Desktop" ,
                        "description": "1440x900" ,
                        "modes" : {
                            "inBrowser" : [ "12" , "127" ],
                            "fullScreen" : [ 0 , 0 ]
                        },
                        "values": [ "1440" , "800" ]
                    },
                    {
                        "name": "20\" Desktop" ,
                        "description": "1600x900" ,
                        "modes" : {
                            "inBrowser" : [ "12" , "127" ],
                            "fullScreen" : [ 0 , 0 ]
                        },
                        "values": [ "1600" , "800" ]
                    },
                    {
                        "name": "22\" Desktop" ,
                        "description": "1680x1050" ,
                        "modes" : {
                            "inBrowser" : [ "12" , "127" ],
                            "fullScreen" : [ 0 , 0 ]
                        },
                        "values": [ "1680" , "950" ]
                    },
                    {
                        "name": "23\" Desktop" ,
                        "description": "1920x1080" ,
                        "modes" : {
                            "inBrowser" : [ "12" , "127" ],
                            "fullScreen" : [ 0 , 0 ]
                        },
                        "values": [ "1920" , "980" ]
                    },
                    {
                        "name": "24\" Desktop" ,
                        "description": "1920x1200" ,
                        "modes" : {
                            "inBrowser" : [ "12" , "127" ],
                            "fullScreen" : [ 0 , 0 ]
                        },
                        "values": [ "1920" , "1100" ]
                    }
                ],
                "default": {
                    "name": "19\" Desktop" ,
                    "description": "1440x900" ,
                    "modes" : {
                        "inBrowser" : [ "12" , "127" ],
                        "fullScreen" : [ 0 , 0 ]
                    },
                    "values": [ "1440" , "800" ]
                }
            },
            {
                "title": "Custom" ,
                "id": "custom",
                "style": "custom-icon"
            }
        ]
    }
} );