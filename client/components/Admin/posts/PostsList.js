import React from "react";
import { Flex } from "rebass";
import PostItem from "./PostItem";
const TITLES = [
  {
    text: "Header",
    span: "col-span-2",
  },
  {
    text: "Domains",
    span: "col-span-3",
  },
  {
    text: "Publised Date",
    span: "col-span-2",
  },
  {
    text: "Update Date",
    span: "col-span-2",
  },
  {
    text: "Likes",
    span: "col-span-1",
  },
  {
    text: "Publised",
    span: "col-span-2",
  },
];
const PostsList = ({ posts }) => {
  console.log(posts);
  return (
    <div className=" w-full h-full max-h-full overflow-y-scroll p-4">
      <h1 className="text-4xl">Posts</h1>
      <div className="border mt-4 rounded-md shadow-xl">
        <div className="grid grid-cols-12 w-full gap-2 bg-blue-100 p-2 px-4  rounded-t-md ">
          {TITLES.map((t) => (
            <div className={`${t.span} font-medium text-blue-600`} key={t.text}>
              {t.text}
            </div>
          ))}
        </div>
        {posts.map((post, idx) => (
          <PostItem post={post} key={idx} idx={idx} />
        ))}
      </div>
    </div>
  );
};

export default PostsList;
