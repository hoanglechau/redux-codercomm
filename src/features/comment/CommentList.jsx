import { Pagination, Stack, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { COMMENTS_PER_POST } from "../../app/config";
import LoadingScreen from "../../components/LoadingScreen";
import CommentCard from "./CommentCard";
import { deleteComment, getComments } from "./commentSlice";

function CommentList({ postId }) {
  const {
    commentsByPost,
    commentsById,
    totalComments,
    isLoading,
    currentPage
  } = useSelector(
    (state) => ({
      commentsByPost: state.comment.commentsByPost[postId],
      totalComments: state.comment.totalCommentsByPost[postId],
      currentPage: state.comment.currentPageByPost[postId] || 1,
      commentsById: state.comment.commentsById,
      isLoading: state.comment.isLoading
    }),
    shallowEqual
  );
  const totalPages = Math.ceil(totalComments / COMMENTS_PER_POST);
  const dispatch = useDispatch();

  const onDelete = (commentId) => {
    dispatch(
      deleteComment({ commentId: commentId, postId, page: currentPage })
    );
  };

  useEffect(() => {
    if ({ postId, totalComments }) dispatch(getComments({ postId }));
  }, [postId, totalComments, dispatch]);

  let renderComments;

  if (commentsByPost) {
    const comments = commentsByPost.map((commentId) => commentsById[commentId]);

    renderComments = (
      <Stack spacing={1.5}>
        {comments.map((comment) => (
          <CommentCard
            key={comment._id}
            comment={comment}
            onDelete={onDelete}
            postId={postId}
          />
        ))}
      </Stack>
    );
  } else if (isLoading) {
    renderComments = <LoadingScreen />;
  }

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="subtitle" sx={{ color: "text.secondary" }}>
          {totalComments > 1
            ? `${totalComments} comments`
            : totalComments === 1
            ? `${totalComments} comment`
            : "No comment"}
        </Typography>
        {totalComments > COMMENTS_PER_POST && (
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(e, page) => dispatch(getComments({ postId, page }))}
          />
        )}
      </Stack>
      {renderComments}
    </Stack>
  );
}

export default CommentList;
