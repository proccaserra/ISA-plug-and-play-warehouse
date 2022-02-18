import { gql } from 'graphql-request';

export const name = 'updateData';

export const query = gql`
  mutation updateData(
    $file: Upload
    $id: ID!
    $name: String
    $type: String
    $addComments: [ID]
    $removeComments: [ID]
    $addProcess_inputs_data: [ID]
    $removeProcess_inputs_data: [ID]
    $addProcess_outputs_data: [ID]
    $removeProcess_outputs_data: [ID]
    $addAssay_dataFiles: ID
    $removeAssay_dataFiles: ID
  ) {
    updateData(
      file: $file
      id: $id
      name: $name
      type: $type
      addComments: $addComments
      removeComments: $removeComments
      addProcess_inputs_data: $addProcess_inputs_data
      removeProcess_inputs_data: $removeProcess_inputs_data
      addProcess_outputs_data: $addProcess_outputs_data
      removeProcess_outputs_data: $removeProcess_outputs_data
      addAssay_dataFiles: $addAssay_dataFiles
      removeAssay_dataFiles: $removeAssay_dataFiles
    ) {
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

export const resolver = 'updateData';

export const transform = undefined;

export default {
  name,
  query,
  resolver,
  transform,
};
