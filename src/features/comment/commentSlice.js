import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import apiService from "../../app/apiService";
import { COMMENTS_PER_POST } from "../../app/config";
import { getCurrentUserProfile } from "../user/userSlice";

const initialState = {
  isLoading: false,
  error: null,
  commentsByPost: {},
  totalCommentsByPost: {},
  currentPageByPost: {},
  commentsById: {}
};

const slice = createSlice({
  name: "comment",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },

    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    getCommentsSuccess(state, action) {
      state.isLoading = false;
      state.error = "";
      const { postId, comments, count, page } = action.payload;

      comments.forEach(
        (comment) => (state.commentsById[comment._id] = comment)
      );
      state.commentsByPost[postId] = comments
        .map((comment) => comment._id)
        .reverse();
      state.totalCommentsByPost[postId] = count;
      state.currentPageByPost[postId] = page;
    },

    createCommentSuccess(state) {
      state.isLoading = false;
      state.error = null;
    },

    sendCommentReactionSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const { commentId, reactions } = action.payload;
      state.commentsById[commentId].reactions = reactions;
    },
    removeCommentSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const { commentId, postId } = action.payload;
      delete state.commentsById[commentId];
      const comment = state.commentsByPost[postId].filter(
        (id) => id !== commentId
      );
      state.commentsByPost = { ...state.commentsByPost, [postId]: comment };
      state.totalCommentsByPost[postId] -= 1;
      if (state.currentPageByPost % 3 === 1) {
        state.currentPageByPost[postId] -= 1;
      }
    },

    removeCommentNotSuccess(state) {
      state.isLoading = false;
      state.error = null;
    },

    updateCommentSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const newComment = action.payload;
      const author = state.commentsById[newComment._id].author;
      state.commentsById[newComment._id] = newComment;
      state.commentsById[newComment._id].author = author;
    }
  }
});

export default slice.reducer;

export const getComments =
  ({ postId, page = 1, limit = COMMENTS_PER_POST }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const params = {
        page,
        limit
      };
      const response = await apiService.get(`/posts/${postId}/comments`, {
        params
      });
      dispatch(
        slice.actions.getCommentsSuccess({
          ...response.data,
          postId,
          page
        })
      );
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const createComment =
  ({ postId, content }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await apiService.post("/comments", {
        content,
        postId
      });
      dispatch(slice.actions.createCommentSuccess(response.data));
      dispatch(getComments({ postId }));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const sendCommentReaction =
  ({ commentId, emoji }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await apiService.post(`/reactions`, {
        targetType: "Comment",
        targetId: commentId,
        emoji
      });
      dispatch(
        slice.actions.sendCommentReactionSuccess({
          commentId,
          reactions: response.data
        })
      );
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const deleteComment =
  ({ commentId, postId }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const text = "Do you want to delete it?";
      if (window.confirm(text) === true) {
        await apiService.delete(`/comments/${commentId}`);
        dispatch(slice.actions.removeCommentSuccess({ commentId, postId }));
        toast.success("Delete comment successfully");
      } else {
        dispatch(slice.actions.removeCommentNotSuccess());
      }
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const updateComment =
  ({ content, commentID }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const data = { content };
      const response = await apiService.put(`/comments/${commentID}`, data);
      toast.success("Update comment successfully");
      dispatch(slice.actions.updateCommentSuccess(response.data));
      dispatch(getCurrentUserProfile());
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };
