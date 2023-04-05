import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import React, { useState } from "react";
import { fDate } from "../../utils/formatTime";
import CommentForm from "./CommentForm";
import CommentReaction from "./CommentReaction";

function CommentCard({ comment, onDelete, postId }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleDelete = () => {
    setAnchorEl(null);
    onDelete(comment._id);
  };

  const handleEdit = () => {
    setIsEdit(true);
    setAnchorEl(null);
  };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right"
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right"
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleEdit} sx={{ mx: 1 }}>
        Edit
      </MenuItem>

      <MenuItem onClick={handleDelete} sx={{ mx: 1 }}>
        Delete
      </MenuItem>
    </Menu>
  );

  return (
    <Stack direction="row" spacing={2}>
      <Avatar alt={comment.author?.name} src={comment.author?.avatarUrl} />

      <Paper sx={{ p: 1.5, flexGrow: 1, bgcolor: "background.neutral" }}>
        <Stack
          direction="row"
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
          sx={{ mb: 0.5 }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {comment.author?.name}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.disabled" }}>
            {fDate(comment.createdAt)}
          </Typography>
        </Stack>

        {isEdit && (
          <CommentForm
            postId={postId}
            commentID={comment._id}
            isEdit={isEdit}
            setIsEdit={setIsEdit}
            handleEdit={handleEdit}
          />
        )}

        {isEdit === false && (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {comment.content}
          </Typography>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <CommentReaction comment={comment} />
        </Box>
      </Paper>
      <Box>
        <IconButton aria-label="Example" onClick={handleProfileMenuOpen}>
          <MoreVertIcon sx={{ fontSize: 20 }} />
        </IconButton>
        {renderMenu}
      </Box>
    </Stack>
  );
}

export default CommentCard;
