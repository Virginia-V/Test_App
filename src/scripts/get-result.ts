import "dotenv/config";
import { s3, HETZNER_BUCKET } from "@/lib/s3";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";

(async () => {
  const res = await s3.send(
    new ListObjectsV2Command({
      Bucket: HETZNER_BUCKET,
      Prefix: "tours/tour-1-1/skin/"
    })
  );
  console.log(res.Contents?.map((obj) => obj.Key));
})();
