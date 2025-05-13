import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, message } from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.core.css';
import { formats, modules as defaultModules } from '~/common/editorConfig';
import { getLibraryRules, updateLibraryRules } from '~/services/systemSettingService';
import { uploadImages } from '~/services/userService';

function LibraryRules() {
    const reactQuillRef = useRef(null);

    const [libraryRules, setLibraryRules] = useState('');
    const [messageApi, contextHolder] = message.useMessage();

    const imageHandler = useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();
        input.onchange = async () => {
            if (input !== null && input.files !== null) {
                const file = input.files[0];
                const loadingMessage = message.loading({ content: 'Đang tải ảnh lên...', duration: 0 });
                try {
                    const response = await uploadImages([file]);
                    const quill = reactQuillRef.current;
                    if (quill && response.data) {
                        const range = quill.getEditorSelection();
                        range && quill.getEditor().insertEmbed(range.index, 'image', response.data.data[0]);
                        message.success({ content: 'Tải ảnh thành công!', duration: 2 });
                    }
                } catch (error) {
                    message.error({ content: 'Đã xảy ra lỗi khi tải ảnh lên.', duration: 2 });
                } finally {
                    if (loadingMessage) {
                        loadingMessage();
                    }
                }
            }
        };
    }, []);

    const handleSave = async () => {
        try {
            const content = { content: libraryRules };

            const response = await updateLibraryRules(content);
            if (response.status === 200) {
                const { message } = response.data.data;
                messageApi.success(message);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi sửa.';
            messageApi.error(errorMessage);
        }
    };

    useEffect(() => {
        const fetchLibraryRules = async () => {
            try {
                const response = await getLibraryRules();
                if (response.status === 200) {
                    setLibraryRules(response.data.data);
                }
            } catch (error) {}
        };

        fetchLibraryRules();
    }, []);

    const modules = {
        ...defaultModules,
        toolbar: {
            ...defaultModules.toolbar,
            handlers: {
                ...defaultModules.toolbar.handlers,
                image: imageHandler,
            },
        },
    };

    return (
        <>
            {contextHolder}

            <h2>Thiết lập nội quy thư viện</h2>
            <form>
                <div className="row g-3">
                    <div className="col-md-9">
                        <span>
                            <span className="text-danger">*</span>Nội quy thư viện:
                        </span>
                        <ReactQuill
                            ref={reactQuillRef}
                            className="custom-quill"
                            placeholder="Nhập nội quy thư viện"
                            modules={modules}
                            formats={formats}
                            value={libraryRules}
                            onChange={setLibraryRules}
                        />
                    </div>
                    <div className="col-12">
                        <Button type="primary" onClick={handleSave}>
                            Lưu
                        </Button>
                    </div>
                </div>
            </form>
        </>
    );
}

export default LibraryRules;
