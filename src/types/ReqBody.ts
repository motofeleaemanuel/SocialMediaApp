export interface UpdateUserRequestBody {
    firstName?: string;
    lastName?: string;
    title?: string;
    company?: string;
    about?: string;
    phone?: string;
    country?: string;
    city?: string;
    address?: string;
    birthday: string;
}

export interface LoginRequestBody {
    email: string;
    password: string;
}

export interface CreatePostRequestBody {
    description: string;
}

export interface AddCommentRequestBody {
    postId: string;
    text: string;
    parentId: string;
}

export interface LikeRequestBody {
    postId: string;
}