import { gql } from 'graphql-request';

export const name = 'readOneData';

export const query = gql`
  query readOneData($id: ID!) {
    readOneData(id: $id) {
      id
      name
      type
      fileName
      mimeType
      fileSize
      fileURL
      urlThumbnail(width: 180, height: 180, format: "png")
    }
  }
`;

export const resolver = 'readOneData';

export const transform = undefined;

export default {
  name,
  query,
  resolver,
  transform,
};
