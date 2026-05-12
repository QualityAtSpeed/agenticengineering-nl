export type InstructorId = 'pascal' | 'collaborator-1';

export type Instructor = {
  id: InstructorId;
  photo: string;
  socials?: { github?: string; linkedin?: string; x?: string };
};

export const instructors: Instructor[] = [
  { id: 'pascal', photo: '/instructors/pascal.png' },
  { id: 'collaborator-1', photo: '/instructors/collaborator-1.png' },
];
