import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import apiService from "../../app/apiService";
import { POSTS_PER_PAGE } from "../../app/config";
import { cloudinaryUpload } from "../../utils/cloudinary";
import { getCurrentUserProfile } from "../user/userSlice";

const initialState = {
  isLoading: false,
  error: null,
  postsById: {},
  currentPagePosts: []
};

const slice = createSlice({
  name: "post",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },

    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    resetPosts(state, action) {
      state.postsById = {};
      state.currentPagePosts = [];
    },

    getPostsSuccess(state, action) {
      state.isLoading = false;
      state.error = null;

      const { posts, count } = action.payload;
      posts.forEach((post) => {
        state.postsById[post._id] = post;
        if (!state.currentPagePosts.includes(post._id))
          state.currentPagePosts.push(post._id);
      });
      state.totalPosts = count;
    },

    createPostSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const newPost = action.payload;

      if (state.currentPagePosts.length % POSTS_PER_PAGE === 0) {
        state.currentPagePosts.pop();
        state.postsById[newPost._id] = newPost;
        state.currentPagePosts.unshift(newPost._id);
      }
      if (state.currentPagePosts.length < POSTS_PER_PAGE) {
        console.log("object 2 sau xóa 2");
        state.postsById[newPost._id] = newPost;
        state.currentPagePosts.unshift(newPost._id);
      }
    },

    sendPostReactionSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const { postId, reactions } = action.payload;
      state.postsById[postId].reactions = reactions;
    },

    removePostSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const { postId } = action.payload;
      const post = state.currentPagePosts.find((post) => post === postId);
      const index = state.currentPagePosts.indexOf(post);
      delete state.postsById[postId];
      state.currentPagePosts.splice(index, 1);
      state.totalPosts -= 1;
    },

    removePostNotSuccess(state) {
      state.isLoading = false;
      state.error = null;
    },

    updatePostSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const { postId } = action.payload;
      const post = state.currentPagePosts.find((post) => post === postId);
      const index = state.currentPagePosts.indexOf(post);
      delete state.postsById[postId];
      state.currentPagePosts.splice(index, 1);
      state.totalPosts -= 1;
    }
  }
});

export default slice.reducer;

export const getPosts =
  ({ userId, page = 1, limit = POSTS_PER_PAGE }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const params = { page, limit };
      const response = await apiService.get(`/posts/user/${userId}`, {
        params
      });

      if (page === 1) dispatch(slice.actions.resetPosts());
      dispatch(slice.actions.getPostsSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const createPost =
  ({ content, image }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const imageUrl = await cloudinaryUpload(image);
      const response = await apiService.post("/posts", {
        content,
        image: imageUrl
      });

      dispatch(slice.actions.createPostSuccess(response.data));
      toast.success("Post successfully");
      dispatch(getCurrentUserProfile());
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const sendPostReaction =
  ({ postId, emoji }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await apiService.post(`/reactions`, {
        targetType: "Post",
        targetId: postId,
        emoji
      });
      dispatch(
        slice.actions.sendPostReactionSuccess({
          postId,
          reactions: response.data
        })
      );
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const deletePost =
  ({ postId }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      let text = "Are you sure you want to delete this post?";
      if (window.confirm(text) === true) {
        const response = await apiService.delete(`/posts/${postId}`);
        dispatch(slice.actions.removePostSuccess({ ...response.data, postId }));
        toast.success("Post deleted successfully");
      } else {
        dispatch(slice.actions.removePostNotSuccess());
      }
      dispatch(getCurrentUserProfile());
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const updatePost =
  ({ postId, content, image }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const imageUrl = await cloudinaryUpload(image);
      const data = { content, image: imageUrl };
      const response = await apiService.put(`/posts/${postId}`, data);
      dispatch(slice.actions.updatePostSuccess(response.data));
      toast.success("Post updated successfully");
      dispatch(getCurrentUserProfile());
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };
