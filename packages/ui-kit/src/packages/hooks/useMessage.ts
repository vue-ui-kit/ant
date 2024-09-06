import { Modal, message } from 'ant-design-vue';

export const $confirm = ({ title, content }) =>
  new Promise<void>((resolve, reject) => {
    Modal.confirm({
      title,
      content,
      onOk: () => {
        resolve();
      },
      onCancel: () => {
        reject();
      },
    });
  });
export const $success = message.success;
export const $error = message.error;
export const $info = message.info;
export const $warning = message.warning;
