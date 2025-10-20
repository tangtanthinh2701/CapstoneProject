export class GetFaceBookDto {
  id: string;
  email: string | null;
  name: string | null;
  picture: { data: { url: string } } | null;
}
