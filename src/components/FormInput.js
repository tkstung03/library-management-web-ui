import { Input } from 'antd';

const FormInput = ({ id, label, className, formik, required = false, helperText = '', ...rest }) => (
    <div className={className}>
        <label htmlFor={id}>
            {required && <span className="text-danger">*</span>} {label}:
        </label>
        <Input
            {...rest}
            id={id}
            name={id}
            value={formik.values[id]}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            status={formik.touched[id] && formik.errors[id] ? 'error' : undefined}
        />
        {formik.touched[id] && formik.errors[id] ? (
            <div className="text-danger">{formik.errors[id]}</div>
        ) : (
            helperText && <div className="text-muted">{helperText}</div>
        )}
    </div>
);

export default FormInput;
