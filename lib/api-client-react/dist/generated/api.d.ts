import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AuthUser, ClientInput, ClientUser, Comment, CommentInput, Document, DocumentInput, HealthStatus, LoginInput, Milestone, MilestoneInput, MilestoneUpdate, Payment, PaymentInput, PaymentUpdate, PendingItems, Photo, PhotoInput, Project, ProjectDetail, ProjectInput, ProjectUpdate, StaffInput, Update, UpdateInput, UploadUrlInput, UploadUrlResponse, UserRoleUpdate } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getLoginUrl: () => string;
/**
 * @summary Login
 */
export declare const login: (loginInput: LoginInput, options?: RequestInit) => Promise<AuthUser>;
export declare const getLoginMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export type LoginMutationResult = NonNullable<Awaited<ReturnType<typeof login>>>;
export type LoginMutationBody = BodyType<LoginInput>;
export type LoginMutationError = ErrorType<void>;
/**
* @summary Login
*/
export declare const useLogin: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export declare const getLogoutUrl: () => string;
/**
 * @summary Logout
 */
export declare const logout: (options?: RequestInit) => Promise<void>;
export declare const getLogoutMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export type LogoutMutationResult = NonNullable<Awaited<ReturnType<typeof logout>>>;
export type LogoutMutationError = ErrorType<unknown>;
/**
* @summary Logout
*/
export declare const useLogout: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export declare const getGetMeUrl: () => string;
/**
 * @summary Get current user
 */
export declare const getMe: (options?: RequestInit) => Promise<AuthUser>;
export declare const getGetMeQueryKey: () => readonly ["/api/portal/auth/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<void>;
/**
 * @summary Get current user
 */
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListProjectsUrl: () => string;
/**
 * @summary List projects for current client (or all for admin)
 */
export declare const listProjects: (options?: RequestInit) => Promise<Project[]>;
export declare const getListProjectsQueryKey: () => readonly ["/api/portal/projects"];
export declare const getListProjectsQueryOptions: <TData = Awaited<ReturnType<typeof listProjects>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProjects>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listProjects>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListProjectsQueryResult = NonNullable<Awaited<ReturnType<typeof listProjects>>>;
export type ListProjectsQueryError = ErrorType<unknown>;
/**
 * @summary List projects for current client (or all for admin)
 */
export declare function useListProjects<TData = Awaited<ReturnType<typeof listProjects>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProjects>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetProjectUrl: (id: number) => string;
/**
 * @summary Get project detail
 */
export declare const getProject: (id: number, options?: RequestInit) => Promise<ProjectDetail>;
export declare const getGetProjectQueryKey: (id: number) => readonly [`/api/portal/projects/${number}`];
export declare const getGetProjectQueryOptions: <TData = Awaited<ReturnType<typeof getProject>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProject>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProject>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProjectQueryResult = NonNullable<Awaited<ReturnType<typeof getProject>>>;
export type GetProjectQueryError = ErrorType<void>;
/**
 * @summary Get project detail
 */
export declare function useGetProject<TData = Awaited<ReturnType<typeof getProject>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProject>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListPhotosUrl: (id: number) => string;
/**
 * @summary List project photos
 */
export declare const listPhotos: (id: number, options?: RequestInit) => Promise<Photo[]>;
export declare const getListPhotosQueryKey: (id: number) => readonly [`/api/portal/projects/${number}/photos`];
export declare const getListPhotosQueryOptions: <TData = Awaited<ReturnType<typeof listPhotos>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPhotos>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listPhotos>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListPhotosQueryResult = NonNullable<Awaited<ReturnType<typeof listPhotos>>>;
export type ListPhotosQueryError = ErrorType<unknown>;
/**
 * @summary List project photos
 */
export declare function useListPhotos<TData = Awaited<ReturnType<typeof listPhotos>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPhotos>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListDocumentsUrl: (id: number) => string;
/**
 * @summary List project documents
 */
export declare const listDocuments: (id: number, options?: RequestInit) => Promise<Document[]>;
export declare const getListDocumentsQueryKey: (id: number) => readonly [`/api/portal/projects/${number}/documents`];
export declare const getListDocumentsQueryOptions: <TData = Awaited<ReturnType<typeof listDocuments>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listDocuments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listDocuments>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListDocumentsQueryResult = NonNullable<Awaited<ReturnType<typeof listDocuments>>>;
export type ListDocumentsQueryError = ErrorType<unknown>;
/**
 * @summary List project documents
 */
export declare function useListDocuments<TData = Awaited<ReturnType<typeof listDocuments>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listDocuments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListUpdatesUrl: (id: number) => string;
/**
 * @summary List project updates
 */
export declare const listUpdates: (id: number, options?: RequestInit) => Promise<Update[]>;
export declare const getListUpdatesQueryKey: (id: number) => readonly [`/api/portal/projects/${number}/updates`];
export declare const getListUpdatesQueryOptions: <TData = Awaited<ReturnType<typeof listUpdates>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUpdates>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listUpdates>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListUpdatesQueryResult = NonNullable<Awaited<ReturnType<typeof listUpdates>>>;
export type ListUpdatesQueryError = ErrorType<unknown>;
/**
 * @summary List project updates
 */
export declare function useListUpdates<TData = Awaited<ReturnType<typeof listUpdates>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUpdates>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListPaymentsUrl: (id: number) => string;
/**
 * @summary List project payments
 */
export declare const listPayments: (id: number, options?: RequestInit) => Promise<Payment[]>;
export declare const getListPaymentsQueryKey: (id: number) => readonly [`/api/portal/projects/${number}/payments`];
export declare const getListPaymentsQueryOptions: <TData = Awaited<ReturnType<typeof listPayments>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPayments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listPayments>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListPaymentsQueryResult = NonNullable<Awaited<ReturnType<typeof listPayments>>>;
export type ListPaymentsQueryError = ErrorType<unknown>;
/**
 * @summary List project payments
 */
export declare function useListPayments<TData = Awaited<ReturnType<typeof listPayments>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPayments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListMilestonesUrl: (id: number) => string;
/**
 * @summary List project milestones
 */
export declare const listMilestones: (id: number, options?: RequestInit) => Promise<Milestone[]>;
export declare const getListMilestonesQueryKey: (id: number) => readonly [`/api/portal/projects/${number}/milestones`];
export declare const getListMilestonesQueryOptions: <TData = Awaited<ReturnType<typeof listMilestones>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listMilestones>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listMilestones>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListMilestonesQueryResult = NonNullable<Awaited<ReturnType<typeof listMilestones>>>;
export type ListMilestonesQueryError = ErrorType<unknown>;
/**
 * @summary List project milestones
 */
export declare function useListMilestones<TData = Awaited<ReturnType<typeof listMilestones>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listMilestones>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListCommentsUrl: (id: number) => string;
/**
 * @summary List project comments
 */
export declare const listComments: (id: number, options?: RequestInit) => Promise<Comment[]>;
export declare const getListCommentsQueryKey: (id: number) => readonly [`/api/portal/projects/${number}/comments`];
export declare const getListCommentsQueryOptions: <TData = Awaited<ReturnType<typeof listComments>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listComments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listComments>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCommentsQueryResult = NonNullable<Awaited<ReturnType<typeof listComments>>>;
export type ListCommentsQueryError = ErrorType<unknown>;
/**
 * @summary List project comments
 */
export declare function useListComments<TData = Awaited<ReturnType<typeof listComments>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listComments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getAddCommentUrl: (id: number) => string;
/**
 * @summary Add a comment to a project
 */
export declare const addComment: (id: number, commentInput: CommentInput, options?: RequestInit) => Promise<Comment>;
export declare const getAddCommentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addComment>>, TError, {
        id: number;
        data: BodyType<CommentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof addComment>>, TError, {
    id: number;
    data: BodyType<CommentInput>;
}, TContext>;
export type AddCommentMutationResult = NonNullable<Awaited<ReturnType<typeof addComment>>>;
export type AddCommentMutationBody = BodyType<CommentInput>;
export type AddCommentMutationError = ErrorType<unknown>;
/**
* @summary Add a comment to a project
*/
export declare const useAddComment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addComment>>, TError, {
        id: number;
        data: BodyType<CommentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof addComment>>, TError, {
    id: number;
    data: BodyType<CommentInput>;
}, TContext>;
export declare const getListClientsUrl: () => string;
/**
 * @summary List all clients
 */
export declare const listClients: (options?: RequestInit) => Promise<ClientUser[]>;
export declare const getListClientsQueryKey: () => readonly ["/api/admin/clients"];
export declare const getListClientsQueryOptions: <TData = Awaited<ReturnType<typeof listClients>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listClients>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listClients>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListClientsQueryResult = NonNullable<Awaited<ReturnType<typeof listClients>>>;
export type ListClientsQueryError = ErrorType<unknown>;
/**
 * @summary List all clients
 */
export declare function useListClients<TData = Awaited<ReturnType<typeof listClients>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listClients>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateClientUrl: () => string;
/**
 * @summary Create a new client account
 */
export declare const createClient: (clientInput: ClientInput, options?: RequestInit) => Promise<ClientUser>;
export declare const getCreateClientMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createClient>>, TError, {
        data: BodyType<ClientInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createClient>>, TError, {
    data: BodyType<ClientInput>;
}, TContext>;
export type CreateClientMutationResult = NonNullable<Awaited<ReturnType<typeof createClient>>>;
export type CreateClientMutationBody = BodyType<ClientInput>;
export type CreateClientMutationError = ErrorType<unknown>;
/**
* @summary Create a new client account
*/
export declare const useCreateClient: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createClient>>, TError, {
        data: BodyType<ClientInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createClient>>, TError, {
    data: BodyType<ClientInput>;
}, TContext>;
export declare const getCreateProjectUrl: () => string;
/**
 * @summary Create a project
 */
export declare const createProject: (projectInput: ProjectInput, options?: RequestInit) => Promise<Project>;
export declare const getCreateProjectMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProject>>, TError, {
        data: BodyType<ProjectInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createProject>>, TError, {
    data: BodyType<ProjectInput>;
}, TContext>;
export type CreateProjectMutationResult = NonNullable<Awaited<ReturnType<typeof createProject>>>;
export type CreateProjectMutationBody = BodyType<ProjectInput>;
export type CreateProjectMutationError = ErrorType<unknown>;
/**
* @summary Create a project
*/
export declare const useCreateProject: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProject>>, TError, {
        data: BodyType<ProjectInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createProject>>, TError, {
    data: BodyType<ProjectInput>;
}, TContext>;
export declare const getUpdateProjectUrl: (id: number) => string;
/**
 * @summary Update project
 */
export declare const updateProject: (id: number, projectUpdate: ProjectUpdate, options?: RequestInit) => Promise<Project>;
export declare const getUpdateProjectMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProject>>, TError, {
        id: number;
        data: BodyType<ProjectUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateProject>>, TError, {
    id: number;
    data: BodyType<ProjectUpdate>;
}, TContext>;
export type UpdateProjectMutationResult = NonNullable<Awaited<ReturnType<typeof updateProject>>>;
export type UpdateProjectMutationBody = BodyType<ProjectUpdate>;
export type UpdateProjectMutationError = ErrorType<unknown>;
/**
* @summary Update project
*/
export declare const useUpdateProject: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProject>>, TError, {
        id: number;
        data: BodyType<ProjectUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateProject>>, TError, {
    id: number;
    data: BodyType<ProjectUpdate>;
}, TContext>;
export declare const getAddPhotoUrl: (id: number) => string;
/**
 * @summary Add photo to project
 */
export declare const addPhoto: (id: number, photoInput: PhotoInput, options?: RequestInit) => Promise<Photo>;
export declare const getAddPhotoMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addPhoto>>, TError, {
        id: number;
        data: BodyType<PhotoInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof addPhoto>>, TError, {
    id: number;
    data: BodyType<PhotoInput>;
}, TContext>;
export type AddPhotoMutationResult = NonNullable<Awaited<ReturnType<typeof addPhoto>>>;
export type AddPhotoMutationBody = BodyType<PhotoInput>;
export type AddPhotoMutationError = ErrorType<unknown>;
/**
* @summary Add photo to project
*/
export declare const useAddPhoto: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addPhoto>>, TError, {
        id: number;
        data: BodyType<PhotoInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof addPhoto>>, TError, {
    id: number;
    data: BodyType<PhotoInput>;
}, TContext>;
export declare const getDeletePhotoUrl: (id: number) => string;
/**
 * @summary Delete a photo (super admin only)
 */
export declare const deletePhoto: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeletePhotoMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deletePhoto>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deletePhoto>>, TError, {
    id: number;
}, TContext>;
export type DeletePhotoMutationResult = NonNullable<Awaited<ReturnType<typeof deletePhoto>>>;
export type DeletePhotoMutationError = ErrorType<unknown>;
/**
* @summary Delete a photo (super admin only)
*/
export declare const useDeletePhoto: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deletePhoto>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deletePhoto>>, TError, {
    id: number;
}, TContext>;
export declare const getApprovePhotoUrl: (id: number) => string;
/**
 * @summary Approve a photo (super admin only)
 */
export declare const approvePhoto: (id: number, options?: RequestInit) => Promise<Photo>;
export declare const getApprovePhotoMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof approvePhoto>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof approvePhoto>>, TError, {
    id: number;
}, TContext>;
export type ApprovePhotoMutationResult = NonNullable<Awaited<ReturnType<typeof approvePhoto>>>;
export type ApprovePhotoMutationError = ErrorType<unknown>;
/**
* @summary Approve a photo (super admin only)
*/
export declare const useApprovePhoto: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof approvePhoto>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof approvePhoto>>, TError, {
    id: number;
}, TContext>;
export declare const getAddDocumentUrl: (id: number) => string;
/**
 * @summary Add document to project
 */
export declare const addDocument: (id: number, documentInput: DocumentInput, options?: RequestInit) => Promise<Document>;
export declare const getAddDocumentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addDocument>>, TError, {
        id: number;
        data: BodyType<DocumentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof addDocument>>, TError, {
    id: number;
    data: BodyType<DocumentInput>;
}, TContext>;
export type AddDocumentMutationResult = NonNullable<Awaited<ReturnType<typeof addDocument>>>;
export type AddDocumentMutationBody = BodyType<DocumentInput>;
export type AddDocumentMutationError = ErrorType<unknown>;
/**
* @summary Add document to project
*/
export declare const useAddDocument: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addDocument>>, TError, {
        id: number;
        data: BodyType<DocumentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof addDocument>>, TError, {
    id: number;
    data: BodyType<DocumentInput>;
}, TContext>;
export declare const getDeleteDocumentUrl: (id: number) => string;
/**
 * @summary Delete a document (super admin only)
 */
export declare const deleteDocument: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteDocumentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteDocument>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteDocument>>, TError, {
    id: number;
}, TContext>;
export type DeleteDocumentMutationResult = NonNullable<Awaited<ReturnType<typeof deleteDocument>>>;
export type DeleteDocumentMutationError = ErrorType<unknown>;
/**
* @summary Delete a document (super admin only)
*/
export declare const useDeleteDocument: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteDocument>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteDocument>>, TError, {
    id: number;
}, TContext>;
export declare const getApproveDocumentUrl: (id: number) => string;
/**
 * @summary Approve a document (super admin only)
 */
export declare const approveDocument: (id: number, options?: RequestInit) => Promise<Document>;
export declare const getApproveDocumentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof approveDocument>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof approveDocument>>, TError, {
    id: number;
}, TContext>;
export type ApproveDocumentMutationResult = NonNullable<Awaited<ReturnType<typeof approveDocument>>>;
export type ApproveDocumentMutationError = ErrorType<unknown>;
/**
* @summary Approve a document (super admin only)
*/
export declare const useApproveDocument: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof approveDocument>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof approveDocument>>, TError, {
    id: number;
}, TContext>;
export declare const getAddUpdateUrl: (id: number) => string;
/**
 * @summary Post an update to project
 */
export declare const addUpdate: (id: number, updateInput: UpdateInput, options?: RequestInit) => Promise<Update>;
export declare const getAddUpdateMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addUpdate>>, TError, {
        id: number;
        data: BodyType<UpdateInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof addUpdate>>, TError, {
    id: number;
    data: BodyType<UpdateInput>;
}, TContext>;
export type AddUpdateMutationResult = NonNullable<Awaited<ReturnType<typeof addUpdate>>>;
export type AddUpdateMutationBody = BodyType<UpdateInput>;
export type AddUpdateMutationError = ErrorType<unknown>;
/**
* @summary Post an update to project
*/
export declare const useAddUpdate: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addUpdate>>, TError, {
        id: number;
        data: BodyType<UpdateInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof addUpdate>>, TError, {
    id: number;
    data: BodyType<UpdateInput>;
}, TContext>;
export declare const getAddMilestoneUrl: (id: number) => string;
/**
 * @summary Add milestone to project
 */
export declare const addMilestone: (id: number, milestoneInput: MilestoneInput, options?: RequestInit) => Promise<Milestone>;
export declare const getAddMilestoneMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addMilestone>>, TError, {
        id: number;
        data: BodyType<MilestoneInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof addMilestone>>, TError, {
    id: number;
    data: BodyType<MilestoneInput>;
}, TContext>;
export type AddMilestoneMutationResult = NonNullable<Awaited<ReturnType<typeof addMilestone>>>;
export type AddMilestoneMutationBody = BodyType<MilestoneInput>;
export type AddMilestoneMutationError = ErrorType<unknown>;
/**
* @summary Add milestone to project
*/
export declare const useAddMilestone: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addMilestone>>, TError, {
        id: number;
        data: BodyType<MilestoneInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof addMilestone>>, TError, {
    id: number;
    data: BodyType<MilestoneInput>;
}, TContext>;
export declare const getUpdateMilestoneUrl: (id: number) => string;
/**
 * @summary Update milestone (mark complete)
 */
export declare const updateMilestone: (id: number, milestoneUpdate: MilestoneUpdate, options?: RequestInit) => Promise<Milestone>;
export declare const getUpdateMilestoneMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMilestone>>, TError, {
        id: number;
        data: BodyType<MilestoneUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateMilestone>>, TError, {
    id: number;
    data: BodyType<MilestoneUpdate>;
}, TContext>;
export type UpdateMilestoneMutationResult = NonNullable<Awaited<ReturnType<typeof updateMilestone>>>;
export type UpdateMilestoneMutationBody = BodyType<MilestoneUpdate>;
export type UpdateMilestoneMutationError = ErrorType<unknown>;
/**
* @summary Update milestone (mark complete)
*/
export declare const useUpdateMilestone: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMilestone>>, TError, {
        id: number;
        data: BodyType<MilestoneUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateMilestone>>, TError, {
    id: number;
    data: BodyType<MilestoneUpdate>;
}, TContext>;
export declare const getAddPaymentUrl: (id: number) => string;
/**
 * @summary Add payment entry to project
 */
export declare const addPayment: (id: number, paymentInput: PaymentInput, options?: RequestInit) => Promise<Payment>;
export declare const getAddPaymentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addPayment>>, TError, {
        id: number;
        data: BodyType<PaymentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof addPayment>>, TError, {
    id: number;
    data: BodyType<PaymentInput>;
}, TContext>;
export type AddPaymentMutationResult = NonNullable<Awaited<ReturnType<typeof addPayment>>>;
export type AddPaymentMutationBody = BodyType<PaymentInput>;
export type AddPaymentMutationError = ErrorType<unknown>;
/**
* @summary Add payment entry to project
*/
export declare const useAddPayment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addPayment>>, TError, {
        id: number;
        data: BodyType<PaymentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof addPayment>>, TError, {
    id: number;
    data: BodyType<PaymentInput>;
}, TContext>;
export declare const getUpdatePaymentUrl: (id: number) => string;
/**
 * @summary Update payment status
 */
export declare const updatePayment: (id: number, paymentUpdate: PaymentUpdate, options?: RequestInit) => Promise<Payment>;
export declare const getUpdatePaymentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePayment>>, TError, {
        id: number;
        data: BodyType<PaymentUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updatePayment>>, TError, {
    id: number;
    data: BodyType<PaymentUpdate>;
}, TContext>;
export type UpdatePaymentMutationResult = NonNullable<Awaited<ReturnType<typeof updatePayment>>>;
export type UpdatePaymentMutationBody = BodyType<PaymentUpdate>;
export type UpdatePaymentMutationError = ErrorType<unknown>;
/**
* @summary Update payment status
*/
export declare const useUpdatePayment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePayment>>, TError, {
        id: number;
        data: BodyType<PaymentUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updatePayment>>, TError, {
    id: number;
    data: BodyType<PaymentUpdate>;
}, TContext>;
export declare const getListPendingUrl: () => string;
/**
 * @summary List all pending photos and documents (super admin only)
 */
export declare const listPending: (options?: RequestInit) => Promise<PendingItems>;
export declare const getListPendingQueryKey: () => readonly ["/api/admin/pending"];
export declare const getListPendingQueryOptions: <TData = Awaited<ReturnType<typeof listPending>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPending>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listPending>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListPendingQueryResult = NonNullable<Awaited<ReturnType<typeof listPending>>>;
export type ListPendingQueryError = ErrorType<unknown>;
/**
 * @summary List all pending photos and documents (super admin only)
 */
export declare function useListPending<TData = Awaited<ReturnType<typeof listPending>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPending>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListUsersUrl: () => string;
/**
 * @summary List all staff users (super admin only)
 */
export declare const listUsers: (options?: RequestInit) => Promise<ClientUser[]>;
export declare const getListUsersQueryKey: () => readonly ["/api/admin/users"];
export declare const getListUsersQueryOptions: <TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListUsersQueryResult = NonNullable<Awaited<ReturnType<typeof listUsers>>>;
export type ListUsersQueryError = ErrorType<unknown>;
/**
 * @summary List all staff users (super admin only)
 */
export declare function useListUsers<TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateStaffUrl: () => string;
/**
 * @summary Create a new staff (admin/super_admin) account
 */
export declare const createStaff: (staffInput: StaffInput, options?: RequestInit) => Promise<ClientUser>;
export declare const getCreateStaffMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createStaff>>, TError, {
        data: BodyType<StaffInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createStaff>>, TError, {
    data: BodyType<StaffInput>;
}, TContext>;
export type CreateStaffMutationResult = NonNullable<Awaited<ReturnType<typeof createStaff>>>;
export type CreateStaffMutationBody = BodyType<StaffInput>;
export type CreateStaffMutationError = ErrorType<unknown>;
/**
* @summary Create a new staff (admin/super_admin) account
*/
export declare const useCreateStaff: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createStaff>>, TError, {
        data: BodyType<StaffInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createStaff>>, TError, {
    data: BodyType<StaffInput>;
}, TContext>;
export declare const getUpdateUserRoleUrl: (id: number) => string;
/**
 * @summary Update a user role (super admin only)
 */
export declare const updateUserRole: (id: number, userRoleUpdate: UserRoleUpdate, options?: RequestInit) => Promise<ClientUser>;
export declare const getUpdateUserRoleMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUserRole>>, TError, {
        id: number;
        data: BodyType<UserRoleUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateUserRole>>, TError, {
    id: number;
    data: BodyType<UserRoleUpdate>;
}, TContext>;
export type UpdateUserRoleMutationResult = NonNullable<Awaited<ReturnType<typeof updateUserRole>>>;
export type UpdateUserRoleMutationBody = BodyType<UserRoleUpdate>;
export type UpdateUserRoleMutationError = ErrorType<unknown>;
/**
* @summary Update a user role (super admin only)
*/
export declare const useUpdateUserRole: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUserRole>>, TError, {
        id: number;
        data: BodyType<UserRoleUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateUserRole>>, TError, {
    id: number;
    data: BodyType<UserRoleUpdate>;
}, TContext>;
export declare const getRequestUploadUrlUrl: () => string;
/**
 * @summary Get presigned upload URL
 */
export declare const requestUploadUrl: (uploadUrlInput: UploadUrlInput, options?: RequestInit) => Promise<UploadUrlResponse>;
export declare const getRequestUploadUrlMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof requestUploadUrl>>, TError, {
        data: BodyType<UploadUrlInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof requestUploadUrl>>, TError, {
    data: BodyType<UploadUrlInput>;
}, TContext>;
export type RequestUploadUrlMutationResult = NonNullable<Awaited<ReturnType<typeof requestUploadUrl>>>;
export type RequestUploadUrlMutationBody = BodyType<UploadUrlInput>;
export type RequestUploadUrlMutationError = ErrorType<unknown>;
/**
* @summary Get presigned upload URL
*/
export declare const useRequestUploadUrl: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof requestUploadUrl>>, TError, {
        data: BodyType<UploadUrlInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof requestUploadUrl>>, TError, {
    data: BodyType<UploadUrlInput>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map