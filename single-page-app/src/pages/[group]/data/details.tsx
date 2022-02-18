import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { createStyles, makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

import NavTabs from '@/components/nav-tabs';
import { useModel, useToastNotification, useZendroClient } from '@/hooks';
import { ModelLayout, PageWithLayout } from '@/layouts';

import { ExtendedClientError } from '@/types/errors';
import { DataRecord } from '@/types/models';
import { RecordUrlQuery } from '@/types/routes';
import { parseErrorResponse } from '@/utils/errors';

import ModelBouncer from '@/zendro/model-bouncer';
import AttributesForm, { ActionHandler } from '@/zendro/record-form';
import { Dialog, Box, Button } from '@mui/material';

import readOneData from '@/overrides/readOneData';
import DownloadIcon from '@mui/icons-material/Download';

import mime from 'mime-types';
import { FileIcon, defaultStyles, DefaultExtensionType } from 'react-file-icon';

const Record: PageWithLayout<RecordUrlQuery> = () => {
  const classes = useStyles();
  const model = useModel('data');
  const router = useRouter();
  const urlQuery = router.query as RecordUrlQuery;
  const { showSnackbar } = useToastNotification();
  const zendro = useZendroClient();
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const handleOpen = (): void => setOpen(true);
  const handleClose = (): void => setOpen(false);

  /* STATE */

  const [recordData, setRecordData] = useState<DataRecord>({
    [model.primaryKey]: urlQuery.id ?? null,
  });
  const [ajvErrors, setAjvErrors] = useState<Record<string, string[]>>();

  const fileExtension = (recordData.id
    ? mime.extension(recordData['mimeType'] as string)
    : 'txt') as DefaultExtensionType;
  const isImage = recordData['mimeType']
    ? (recordData['mimeType'] as string).includes('image')
    : undefined;

  /* AUXILIARY */

  const parseAndDisplayErrorResponse = (
    error: Error | ExtendedClientError
  ): void => {
    const parsedError = parseErrorResponse(error);

    if (
      parsedError.genericError ||
      parsedError.networkError ||
      parsedError.graphqlErrors?.nonValidationErrors.length
    ) {
      showSnackbar(
        t('errors.server-error', { status: parsedError.status }),
        'error',
        parsedError
      );
    }
  };

  /* ACTION HANDLERS */

  /**
   * Exit the form and go back to the model table page.
   */
  const handleOnCancel: ActionHandler = () => {
    router.push(`/models/data`);
  };

  /**
   * Reload page data.
   */
  const handleOnReload: ActionHandler = () => {
    const revalidateData = async (): Promise<void> => {
      mutateRecord(undefined, true);
    };

    revalidateData();
  };

  /**
   * Navigate to the record details page.
   */
  const handleOnUpdate: ActionHandler = () => {
    router.push(`/models/data/edit?id=${urlQuery.id}`);
  };

  /* REQUEST */

  /**
   * Query data from the GraphQL endpoint.
   */
  const { mutate: mutateRecord } = useSWR<
    DataRecord | undefined,
    ExtendedClientError<Record<string, DataRecord>>
  >(
    [zendro, urlQuery.id],
    async () => {
      const request = readOneData;
      const variables = {
        [model.primaryKey]: urlQuery.id,
      };
      const response = await zendro.request<Record<string, DataRecord>>(
        request.query,
        { variables }
      );
      if (response) return response[request.resolver];
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      onSuccess: (data) => {
        setRecordData(
          data ?? {
            [model.primaryKey]: urlQuery.id ?? null,
          }
        );
        setAjvErrors(undefined);
      },
      onError: parseAndDisplayErrorResponse,
    }
  );

  return (
    <ModelBouncer object="data" action="read">
      <NavTabs
        id={urlQuery.id as string}
        active={router.asPath}
        tabs={[
          {
            type: 'link',
            label: 'attributes',
            href: router.asPath,
          },
          {
            type: 'group',
            label: 'associations',
            links: model.associations?.map((assoc) => ({
              type: 'link',
              label: assoc.name,
              href: `/models/data/details/${assoc.name}?id=${urlQuery.id}`,
            })),
          },
        ]}
      />

      <AttributesForm
        attributes={model.attributes}
        className={classes.root}
        data={recordData}
        disabled
        errors={ajvErrors}
        formId={router.asPath}
        formView="read"
        modelName="data"
        actions={{
          cancel: handleOnCancel,
          reload: handleOnReload,
          update:
            model.permissions.update && model.apiPrivileges.update
              ? handleOnUpdate
              : undefined,
        }}
        info={
          <>
            {recordData.fileURL &&
              recordData.urlThumbnail &&
              (isImage ? (
                <>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={handleOpen}
                    onKeyDown={handleOpen}
                    className={classes.image}
                  >
                    <img
                      alt="Not Found"
                      src={recordData.urlThumbnail as string}
                    ></img>
                  </div>
                  <Dialog open={open} onClose={handleClose} maxWidth="xl">
                    <img
                      alt="Not Found"
                      src={recordData.fileURL as string}
                    ></img>
                  </Dialog>
                </>
              ) : (
                <Box maxWidth="3rem">
                  <FileIcon
                    extension={fileExtension}
                    {...defaultStyles[fileExtension]}
                  />
                </Box>
              ))}
            <Box marginTop="1rem">
              <a
                href={recordData.fileURL as string}
                download={recordData.fileName}
              >
                <Button variant="outlined" startIcon={<DownloadIcon />}>
                  {`${t('record-form.download-file')}`}
                </Button>
              </a>
            </Box>
          </>
        }
      />
    </ModelBouncer>
  );
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      overflowY: 'auto',
    },
    image: {
      cursor: 'pointer',
    },
    fileUploadButton: {
      marginRight: '1rem',
      boxShadow: theme.shadows[4],
      backgroundColor: theme.palette.grey[300],
      // color: theme.palette.primary.dark,
      '&:hover': {
        backgroundColor: theme.palette.primary.background,
        color: theme.palette.primary.main,
      },
    },
  })
);

Record.layout = ModelLayout;
export default Record;
