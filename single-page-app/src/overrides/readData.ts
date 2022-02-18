import { gql } from 'graphql-request';

export const name = 'readData';

export const query = gql`
  query readData(
    $order: [orderDataInput]
    $search: searchDataInput
    $pagination: paginationCursorInput!
  ) {
    dataConnection(order: $order, search: $search, pagination: $pagination) {
      pageInfo {
        startCursor
        endCursor
        hasPreviousPage
        hasNextPage
      }
      edges {
        node {
          id
          name
          type
          fileName
          mimeType
          fileSize
          fileURL
          urlThumbnail(width: 50, height: 50, format: "png")
        }
      }
    }
  }
`;

export const resolver = 'dataConnection';

export const transform =
  '.dataConnection.pageInfo as $pageInfo | .dataConnection.edges | map(.node) as $records | {  $pageInfo, $records  }';

export default {
  name,
  query,
  resolver,
  transform,
};
