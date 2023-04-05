import SendIcon from "@mui/icons-material/Send";
import { Avatar, IconButton, Stack, TextField } from "@mui/material";
import React, { useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import useAuth from "../../hooks/useAuth";
import { createComment, updateComment } from "./commentSlice";

function CommentForm({ postId, commentID, setIsEdit, isEdit }) {
  const { commentsById } = useSelector(
    (state) => ({
      commentsById: state.comment.commentsById
    }),
    shallowEqual
  );

  const { user } = useAuth();
  let text = "";
  if (commentsById && commentID) {
    text = commentsById[commentID].content;
  }

  const [content, setContent] = useState(text);
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    if (!isEdit) {
      e.preventDefault();
      dispatch(createComment({ postId, content }));
      setContent("");
      return;
    }
    if (isEdit) {
      e.preventDefault();
      dispatch(updateComment({ content, commentID, postId }));
      setContent("");
      setIsEdit(false);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <Stack direction="row" alignItems="center">
        <Avatar src={user.avatarUrl} alt={user.name} />
        <TextField
          fullWidth
          size="small"
          value={content}
          placeholder="Write a comment…"
          onChange={(event) => setContent(event.target.value)}
          sx={{
            ml: 2,
            mr: 1,
            "& fieldset": {
              borderWidth: `1px !important`,
              borderColor: (theme) => `${theme.palette.grey[500_32]} !important`
            }
          }}
        />
        <IconButton type="submit">
          <SendIcon sx={{ fontSize: 30 }} />
        </IconButton>
      </Stack>
    </form>
  );
}

export default CommentForm;
