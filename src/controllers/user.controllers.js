import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  //get user detail from frontend
  //validation-not empty
  //check if user already exist :: username , email
  //check for images,check for avatar
  //upload them in cloudinary
  //create user object - create entry in db
  //remove password and refresh token field from response
  //check for user creation
  //return res

  const { fullName, email, username, password } = req.body;
  console.log("Email is", email);

  //validation-not empty
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All Fields are Required !!!");
  }

  //check if user already exist :: username , email
  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exist");
  }

  //check for images,check for avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required !!!");
  }

  //upload them in cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  //create user object - create entry in db
  const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    password,
  });

  //check for user creation
  const createdUser = await User.findById(user._id).select(
    "-password  -refreshToken"
    //remove password and refresh token field from response
  );

  if (!createdUser) {
    throw new ApiError(
      500,
      "Something went worng while registration of User !!! "
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User created Successfully !!!"));
});

export { registerUser };
