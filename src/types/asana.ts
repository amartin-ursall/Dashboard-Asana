export interface AsanaUser {
  gid: string;
  name: string;
  photo?: {
    image_60x60: string;
  };
}
export interface AsanaProject {
  gid: string;
  name: string;
}
export interface AsanaTask {
  gid: string;
  name: string;
  assignee: AsanaUser | null;
  due_on: string | null;
  completed: boolean;
  projects: AsanaProject[];
  permalink_url: string;
}
export interface AsanaTasksResponse {
  data: AsanaTask[];
}
export interface AsanaWorkspace {
  gid: string;
  name: string;
  resource_type: string;
}
export interface AsanaWorkspaceResponse {
  data: AsanaWorkspace[];
}
export interface AsanaProjectDetails {
  gid: string;
  name: string;
  permalink_url: string;
  color: string | null;
  owner: {
    gid: string;
    name: string;
  } | null;
  current_status: {
    color: string;
    title: string;
  } | null;
  due_on: string | null;
  notes?: string;
  created_at?: string;
  modified_at?: string;
  workspace?: {
    gid: string;
    name: string;
  };
}
export interface AsanaProjectsResponse {
  data: AsanaProjectDetails[];
}
export interface AsanaProjectDetailResponse {
  data: AsanaProjectDetails;
}