interface Resource {
  _id: string;
  name: string;
  imageId?: string;
  imageName?: string;
  notes?: string;
}

interface Project {
  _id: string;
  name: string;
  imageId?: string;
  imageName?: string;
  description?: string;
  notes?: string;
}

interface Block {
  _id: string;
  type: string;
  x: number;
  y: number;
  createdAt?: Date;
  width?: number;
  height?: number;
  items?: string[];
  resources?: Resource[];
  stickyText?: string;
  projects?: Project[];
  images?: Record<string, string | undefined>;
}
