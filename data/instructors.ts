export type InstructorId = 'pascal' | 'inico';

export type Instructor = {
  id: InstructorId;
  photo: string;
  socials?: { github?: string; linkedin?: string; x?: string };
};

export const instructors: Instructor[] = [
  { id: 'pascal', photo: '/instructors/pascal.jpeg' },
  { id: 'inico', photo: '/instructors/inico.jpeg' },
];
