import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSaveCallback, useClearDataCallback } from "../../Editor/hooks";
import { options } from "../../Editor/options";
// import OptionsMenu from "../../components/Posts/OptionsMenu";
import { useSelector, useDispatch } from "react-redux";
import { createPost } from "../../actions/postActions";
import Alert from "../../components/common/Alert";
import { TYPES } from "../../utils";
import Spinner from "../../components/common/Spinner";
import { getCategories } from "../../actions/categories";

const Editor = dynamic(
  () => import("../../Editor/editor").then((mod) => mod.EditorContainer),
  { ssr: false }
);

// Will replace all of this and get it from the api
const LEVELS = ["BASICS", "INTERMEDIATE", "ADVANCED"];
const CATEGORIES = ["WEB", "ML", "DS", "DEVOPS"];
const SUB_CATEGORY = ["SUB1", "SUB2", "SUB3"];

const savedPost = "draft-post";
const Create = () => {
  const [editor, setEditor] = useState(null);
  const [publish, setPublised] = useState(false);
  const [header, setHeader] = useState("");
  const [level, setLevel] = useState(LEVELS[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subcategory, setSubcategory] = useState(SUB_CATEGORY[0]);
  const [tags, setTags] = useState("");
  const [editorData, setEditorData] = useState({});
  const [shouldLoadData, setShouldData] = useState(false);
  const [alert, setAlert] = useState({
    type: null,
    message: null,
  });
  // save handler
  const onSave = useSaveCallback(editor);

  // clear data callback
  const clearData = useClearDataCallback(editor);
  // Store a screenshot of the current state in the localstorate under the name of the draft-post
  const saveToLS = async () => {
    const out = await editor.save();
    const data = JSON.stringify({
      header,
      category,
      tags,
      subcategory,
      publish,
      level,
      data: out,
    });
    localStorage.setItem(savedPost, data);
    setAlert({
      type: TYPES.SUCCESS,
      message: "Post saved as a draft",
    });
  };

  const loadFromLS = () => {
    const data = localStorage.getItem(savedPost)
      ? JSON.parse(localStorage.getItem(savedPost))
      : null;

    if (!data) {
      setAlert({
        type: TYPES.ERROR,
        message: "You don't have any posts stored in the localStorage",
      });
      return;
    }
    setHeader(data.header);
    setCategory(data.category);
    setTags(data.tags);
    setSubcategory(data.subcategory);
    setPublised(data.publish);
    setLevel(data.level);
    editor.isReady.then(() => {
      // fixing an annoying warning in Chrome `addRange(): The given range isn't in document.`
      setTimeout(() => {
        editor.render(data.data);
      }, 100);
    });
  };

  const dispatch = useDispatch();
  const createPostState = useSelector((state) => state.createPost);
  const categories = useSelector((state) => state.categories);

  useEffect(() => {
    if (!categories.categories) {
      dispatch(getCategories());
    }
  }, []);
  const publishPost = async () => {
    const out = await editor.save();
    dispatch(
      createPost({
        header,
        domain: {
          level,
          categories: [category],
          subcategory: [subcategory],
          tags: tags.split(","),
        },
        published: publish,
        body: out,
      })
    );
  };
  const OPTIONS_LIST = [
    {
      text: "Save To DB",
    },
    {
      text: "Save To LS",
      onClick: saveToLS,
    },
    {
      text: "Load From LS",
      onClick: loadFromLS,
    },
    {
      text: "Publish",
      onClick: publishPost,
    },
  ];

  useEffect(() => {
    if (createPostState.error) {
      setAlert({
        type: TYPES.ERROR,
        message: createPostState.error,
      });
    }
    if (createPostState.success) {
      setAlert({
        type: TYPES.SUCCESS,
        message: createPostState.success,
      });
    }

    return () => {
      setAlert({
        type: "",
        message: "",
      });
    };
  }, [createPostState]);
  return (
    <div className=" max-h-screen w-full p-4  overflow-y-scroll">
      {createPostState.loading && (
        <div className="mb-3 flex items-center justify-center">
          <Spinner />
        </div>
      )}
      {alert.message && (
        <div className="mb-3">
          <Alert type={alert.type} message={alert.message} />
        </div>
      )}
      <div className="flex items-center justify-end mb-4">
        {OPTIONS_LIST.map((option) => (
          <button
            onClick={option.onClick}
            className="bg-blue-100 mr-2 py-2 px-3 rounded-md shadow-md text-blue-600  hover:bg-blue-200"
          >
            {option.text}
          </button>
        ))}
      </div>
      <div className="flex justify-center flex-col mb-9">
        <label className="text-lg font-medium mb-4">Header</label>
        <input
          value={header}
          onChange={(e) => setHeader(e.target.value)}
          className="py-3 px-4 bg-gray-100 shadow-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
          name="header"
          placeholder="Blog Title.."
        />
      </div>
      <div className="flex flex-col justify-center mb-9">
        <label className="text-lg font-medium mb-4">Tags</label>
        <input
          className="py-3 px-4 bg-gray-100 shadow-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="Enter coma seperated values..."
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>
      <div className="mb-6">
        {categories.loading ? (
          <div>
            <Spinner />
          </div>
        ) : categories.error ? (
          <div>
            <Alert type={TYPES.ERROR} message={categories.error} />
          </div>
        ) : (
          categories.categories && (
            <div>
              {categories.categories.map((cat) => (
                <p
                  key={cat._id}
                  className="py-2 px-3 bg-gray-100 text-gray-600"
                >
                  {cat.name}
                </p>
              ))}
            </div>
          )
        )}
      </div>

      <Editor
        reInit
        editorRef={setEditor}
        options={options}
        data={editorData}
      />
    </div>
  );
};

export default Create;
