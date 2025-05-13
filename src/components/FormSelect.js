import { Select } from 'antd';

const FormSelect = ({
    required = false,
    multiple = false,
    id,
    label,
    className,
    formik,
    options,
    loading,
    onSearch,
    fieldNames,
}) => (
    <div className={className}>
        <label htmlFor={id}>
            {required && <span className="text-danger">*</span>} {label}:
        </label>
        <Select
            mode={multiple ? 'multiple' : undefined}
            showSearch
            allowClear={!required}
            onSearch={onSearch}
            filterOption={false}
            id={id}
            name={id}
            value={formik.values[id]}
            onChange={(value) => formik.setFieldValue(id, value)}
            onBlur={() => formik.setFieldTouched(id, true)}
            status={formik.touched[id] && formik.errors[id] ? 'error' : undefined}
            loading={loading}
            placeholder={`Chọn ${label.toLowerCase()}`}
            style={{ width: '100%' }}
            options={options}
            fieldNames={fieldNames}
        />
        <div className="text-danger">{formik.touched[id] && formik.errors[id]}</div>
    </div>
);

export default FormSelect;
