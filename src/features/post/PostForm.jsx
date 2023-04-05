import { yupResolver } from "@hookform/resolvers/yup";
import { LoadingButton } from "@mui/lab";
import { alpha, Box, Card, Stack } from "@mui/material";
import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { FormProvider, FTextField, FUploadImage } from "../../components/form";
import { createPost, updatePost } from "./postSlice";

const yupSchema = Yup.object().shape({
  content: Yup.string().required("Content is required")
});

function PostForm({ post, isEdit, setIsEdit }) {
  let textEdit;
  let imageEdit;
  if (isEdit) {
    textEdit = post.content;
    imageEdit = post.image;
  } else {
    textEdit = "";
    imageEdit = "";
  }
  const defaultValues = {
    content: textEdit,
    image: imageEdit
  };
  const methods = useForm({
    resolver: yupResolver(yupSchema),
    defaultValues
  });
  const {
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmiting }
  } = methods;
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.post);

  const onSubmit = (data) => {
    if (isEdit) {
      const { content, image } = data;
      dispatch(updatePost({ postId: post._id, content, image }));
      setIsEdit(false);
    } else {
      dispatch(createPost(data)).then(() => reset());
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setValue(
          "image",
          Object.assign(file, { preview: URL.createObjectURL(file) })
        );
      }
    },
    [setValue]
  );

  return (
    <Card sx={{ p: 3 }}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <FTextField
            name="content"
            multiline
            fullWidth
            rows={4}
            placeholder="Share what you are thinking here..."
            sx={{
              "& fieldset": {
                borderWidth: `1px !important`,
                borderColor: alpha("#919EAB", 0.32)
              }
            }}
          />
          <FUploadImage
            name="image"
            accept="image/*"
            maxSize={3145728}
            onDrop={handleDrop}
          />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end"
            }}
          >
            <LoadingButton
              type="submit"
              variant="contained"
              size="small"
              loading={isSubmiting || isLoading}
            >
              Post
            </LoadingButton>
          </Box>
        </Stack>
      </FormProvider>
    </Card>
  );
}

export default PostForm;
