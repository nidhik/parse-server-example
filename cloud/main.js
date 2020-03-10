const Mux = require('@mux/mux-node');
const uuid = require('uuid/v1');

// This assumes you have MUX_TOKEN_ID and MUX_TOKEN_SECRET 
// environment variables.
const { Video } = new Mux();


Parse.Cloud.define('upload', async function(req) {
  const id = uuid();
  
  // Create a new upload using the Mux SDK.
  const upload = await Video.Uploads.create({
    // Set the CORS origin to your application.
    cors_origin: 'https://tiktokclone.herokuapp.com',

    // Specify the settings used to create the new Asset after
    // the upload is complete
    new_asset_settings: {
      passthrough: id,
      playback_policy: 'public',
    }
  });
  var Post = Parse.Object.extend({
    className: "Post"
  });
  var post = new Post()
  post.set("uploadId", upload.id);
  post.set("passthrough", id);
  // post.set("metadata", assetInfo);
  post.set("status", 'waiting_for_upload');
  return post.save().then((post) => {
    // Now send back that ID and the upload URL so the client can use it!
    return {id: id, url: upload.url};
  }, (error) => {
    return({error: error});
  })
});

Parse.Cloud.define('webhook', async function(req) {
  const { type: eventType, data: eventData } = await json(req);
  console.log('received mux event! ' + eventType);
  
  const Post = Parse.Object.extend("Post")
  
  switch (eventType) {
    case 'video.asset.created': {
      const query = new Parse.Query(Post);
      query.equalTo("passthrough", eventData.passthrough);
      const post = await query.first()
      if (post.get("status") !== 'ready') {
        post.set('status', 'created')
        post.set('asset', eventData)
        return post.save()
      }
    };
    case 'video.asset.ready': {
      const query = new Parse.Query(Post);
      query.equalTo("passthrough", eventData.passthrough);
      const post = await query.first()
      post.set('status', 'ready')
      post.set('asset', eventData)
      return post.save()
    };
    default:
      // ignore the rest
      console.log('some other mux event! ' + eventType);
  }
});
