export const modules = {
    toolbar: {
        container: [
            [{ font: [] }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ size: ['huge', 'large', false, 'small'] }], // custom dropdown
            ['bold', 'italic', 'underline', 'strike'], // toggled buttons
            [{ color: [] }, { background: [] }], // dropdown with defaults from theme
            ['blockquote', 'code-block'],
            ['link', 'image', 'video', 'formula'],
            [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
            [{ align: [] }],
            [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
            [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
            [{ direction: 'rtl' }], // text direction
            ['clean'], // remove formatting button
        ],
    },
    clipboard: {
        matchVisual: false,
    },
};

export const formats = [
    'font',
    'header',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'blockquote',
    'code-block',
    'link',
    'image',
    'formula',
    'video',
    'list',
    'bullet',
    'check',
    'align',
    'indent',
    'script',
    'direction',
];
