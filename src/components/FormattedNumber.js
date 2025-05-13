function FormattedNumber({ number }) {
    const formattedNumber = number.toLocaleString();
    return <>{formattedNumber}</>;
}

export default FormattedNumber;
