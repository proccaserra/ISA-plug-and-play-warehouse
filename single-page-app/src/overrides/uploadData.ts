import { gql } from 'graphql-request';

export const name = 'uploadData';

export const query = gql`
  mutation uploadData($file: Upload, $id: ID!, $name: String, $type: String) {
    addData(file: $file, id: $id, name: $name, type: $type) {
      id
      name
      type
      fileName
      mimeType
      fileSize
      fileURL
    }
  }
`;

export const resolver = 'addData';

export const transform = undefined;

export default {
  name,
  query,
  resolver,
  transform,
};
