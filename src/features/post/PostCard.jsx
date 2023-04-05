import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Avatar,
  Box,
  Card,
  CardHeader,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Stack,
  Typography
} from "@mui/material";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { fDate } from "../../utils/formatTime";
import CommentForm from "../comment/CommentForm";
import CommentList from "../comment/CommentList";
import PostForm from "./PostForm";
import PostReaction from "./PostReaction";
import { deletePost } from "./postSlice";

function PostCard({ post, userId }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const dispatch = useDispatch();
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

    dispatch(deletePost({ postId: post._id, userId }));
  };
  const handleEdit = () => {
    setAnchorEl(null);
    setIsEdit(true);
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
    <Card>
      <CardHeader
        disableTypography
        avatar={
          <Avatar src={post?.author?.avatarUrl} alt={post?.author?.name} />
        }
        title={
          <Link
            variant="subtitle2"
            color="text.primary"
            component={RouterLink}
            sx={{ fontWeight: 600 }}
            to={`/user/${post.author._id}`}
          >
            {post?.author?.name}
          </Link>
        }
        subheader={
          <Typography
            variant="caption"
            sx={{ display: "block", color: "text.secondary" }}
          >
            {fDate(post.createdAt)}
          </Typography>
        }
        action={
          <Box>
            <IconButton aria-label="Example" onClick={handleProfileMenuOpen}>
              <MoreVertIcon sx={{ fontSize: 30 }} />
            </IconButton>
            {renderMenu}
          </Box>
        }
      />

      <Stack spacing={2} sx={{ p: 3 }}>
        {isEdit === true && (
          <PostForm
            post={post}
            isEdit={isEdit}
            setIsEdit={setIsEdit}
            // handleEdit={handleEdit}
          />
        )}
        {isEdit === false && <Typography>{post.content}</Typography>}

        {post.image && (
          <Box
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              height: 300,
              "& img": { objectFit: "cover", width: 1, height: 1 }
            }}
          >
            <img src={post.image} alt="post" />
          </Box>
        )}

        <PostReaction post={post} userId={userId} />
        <CommentList postId={post._id} />
        <CommentForm postId={post._id} />
      </Stack>
    </Card>
  );
}

export default PostCard;
