const Mux = require('@mux/mux-node');
const uuid = require('uuid/v1');

// This assumes you have MUX_TOKEN_ID and MUX_TOKEN_SECRET 
// environment variables.
const { Video } = new Mux();


Parse.Cloud.define('upload', async function(req, res) {
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
  // post.set("metadata", assetInfo);
  post.set("status", 'waiting_for_upload');
  
   // Now send back that ID and the upload URL so the client can use it!
  return {id: id, url: upload.url };
});
