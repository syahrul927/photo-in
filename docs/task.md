1. I want to insert to photos table, complete the field based on data with action picked.
   here's the response example I get

```json
{
  "action": "picked",
  "viewToken": [
    "all",
    null,
    {
      "parent": "1uaMWz1QJWcQA4oAWV0w16bOH0_OybZqP"
    }
  ],
  "docs": [
    {
      "id": "1niKCXBg9edJa3hFKECXEqrwFEXvqNtEh",
      "serviceId": "docs",
      "mimeType": "image/jpeg",
      "name": "FIRF-4126.jpg",
      "description": "",
      "type": "photo",
      "lastEditedUtc": 1754144584783,
      "iconUrl": "https://drive-thirdparty.googleusercontent.com/16/type/image/jpeg",
      "url": "https://drive.google.com/file/d/1niKCXBg9edJa3hFKECXEqrwFEXvqNtEh/view?usp=drive_web",
      "embedUrl": "https://drive.google.com/file/d/1niKCXBg9edJa3hFKECXEqrwFEXvqNtEh/preview?usp=drive_web",
      "sizeBytes": 642342,
      "rotation": 0,
      "rotationDegree": 0,
      "parentId": "1uaMWz1QJWcQA4oAWV0w16bOH0_OybZqP",
      "isShared": true
    },
    {
      "id": "1XdKm0oaU7zeybGVuip__EB1NZR567MRr",
      "serviceId": "docs",
      "mimeType": "image/jpeg",
      "name": "FIRF-4114.jpg",
      "description": "",
      "type": "photo",
      "lastEditedUtc": 1754142389814,
      "iconUrl": "https://drive-thirdparty.googleusercontent.com/16/type/image/jpeg",
      "url": "https://drive.google.com/file/d/1XdKm0oaU7zeybGVuip__EB1NZR567MRr/view?usp=drive_web",
      "embedUrl": "https://drive.google.com/file/d/1XdKm0oaU7zeybGVuip__EB1NZR567MRr/preview?usp=drive_web",
      "sizeBytes": 657957,
      "rotation": 0,
      "rotationDegree": 0,
      "parentId": "1uaMWz1QJWcQA4oAWV0w16bOH0_OybZqP",
      "isShared": true
    },
    {
      "id": "1ejV6tRKvzcTM3f1M8Yvcu41ihBNhx6h5",
      "serviceId": "docs",
      "mimeType": "image/jpeg",
      "name": "FIRF-4112.jpg",
      "description": "",
      "type": "photo",
      "lastEditedUtc": 1754142387684,
      "iconUrl": "https://drive-thirdparty.googleusercontent.com/16/type/image/jpeg",
      "url": "https://drive.google.com/file/d/1ejV6tRKvzcTM3f1M8Yvcu41ihBNhx6h5/view?usp=drive_web",
      "embedUrl": "https://drive.google.com/file/d/1ejV6tRKvzcTM3f1M8Yvcu41ihBNhx6h5/preview?usp=drive_web",
      "sizeBytes": 870960,
      "rotation": 0,
      "rotationDegree": 0,
      "parentId": "1uaMWz1QJWcQA4oAWV0w16bOH0_OybZqP",
      "isShared": true
    }
  ]
}
```

2. yes, I want to use secure image url. but to reduce the time request. I want to remove validation in existing router to get secureImage by selecting to database.
3. after picked action trigger (triggered when react-google-drive-picker close), I want to show modal confirmation. Since it was "picker", it can be pick the existing image, I want to validate the existing image on database and the picked one.
   create UI to flagging the existing image (I don't know maybe like border or seperate the section. give me your recommendation). there a button confirmation after that it will loading when submitting.
   for the logic check existing image, I want you query by eventId then compare list cloudId from db with the list id from data callback. maybe it will more fast either query IN or one by one to db.
4. for error handling, just show notification. let user try again, since the concept was "pick" it would be okay.
5. yes, just look at mimeType from the data callback.
