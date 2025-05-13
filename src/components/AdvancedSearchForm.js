import { useState } from 'react';
import { Button, Input, Select, Space } from 'antd';
import { FaRegTrashAlt, FaRetweet, FaSearch, FaPlus } from 'react-icons/fa';

const searchFieldOptions = [
    { label: 'Nhan đề', value: 'title' },
    { label: 'Tác giả', value: 'author' },
    { label: 'Nhà xuất bản', value: 'publisher' },
    { label: 'Năm xuất bản', value: 'publicationYear' },
    { label: 'Số ISBN', value: 'isbn' },
];

const conditionOptions = [
    { value: 'AND', label: 'Và' },
    { value: 'OR', label: 'Hoặc' },
];

const comparisonOptions = [
    { value: 'EQUALS', label: 'Chính xác' },
    { value: 'NOT_EQUALS', label: 'Không chính xác' },
    { value: 'GREATER_THAN', label: 'Lớn hơn' },
    { value: 'LESS_THAN', label: 'Nhỏ hơn' },
    { value: 'LIKE', label: 'Chứa' },
    { value: 'IN', label: 'Nằm trong' },
];

const defaultValue = {
    field: searchFieldOptions[0].value,
    operator: comparisonOptions[4].value,
    value: '',
    joinType: conditionOptions[0].value,
    values: [],
};

function AdvancedSearchForm({ onSearch }) {
    const [searchCriteria, setSearchCriteria] = useState([{ ...defaultValue }]);

    const addCriteria = () => {
        const newCriteria = { ...defaultValue };
        setSearchCriteria([...searchCriteria, newCriteria]);
    };

    const deleteCriteria = (index) => {
        const newCriteria = searchCriteria.filter((_, i) => i !== index);
        setSearchCriteria(newCriteria);
    };

    const resetCriteria = () => {
        setSearchCriteria([defaultValue]);
    };

    const handleInputChange = (index, field, value) => {
        const newCriteria = [...searchCriteria];

        newCriteria[index][field] = value;
        setSearchCriteria(newCriteria);
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();

        const formattedCriteria = searchCriteria.map(({ field, operator, value, joinType }) => ({
            field,
            operator,
            value,
            values: value.split(',').map((item) => item.trim()),
            joinType,
        }));

        onSearch(formattedCriteria);
    };

    return (
        <>
            <form onSubmit={handleSearchSubmit}>
                <div>
                    {searchCriteria.map((criteria, index) => (
                        <Space key={index} className="mb-2">
                            {index > 0 ? (
                                <Select
                                    size="large"
                                    value={searchCriteria[index - 1].joinType}
                                    style={{ width: 120 }}
                                    options={conditionOptions}
                                    onChange={(value) => handleInputChange(index - 1, 'joinType', value)}
                                />
                            ) : (
                                <div style={{ width: 120 }}></div>
                            )}
                            <Input
                                name="value"
                                size="large"
                                placeholder="Nhập từ khóa"
                                value={criteria.value}
                                onChange={(e) => handleInputChange(index, 'value', e.target.value)}
                            />
                            <Select
                                size="large"
                                value={criteria.operator}
                                style={{ width: 180 }}
                                options={comparisonOptions}
                                onChange={(value) => handleInputChange(index, 'operator', value)}
                            />
                            <span>Trong</span>
                            <Select
                                size="large"
                                value={criteria.field}
                                style={{ width: 150 }}
                                options={searchFieldOptions}
                                onChange={(value) => handleInputChange(index, 'field', value)}
                            />

                            {index > 0 && (
                                <Button
                                    type="text"
                                    danger
                                    icon={<FaRegTrashAlt />}
                                    onClick={() => deleteCriteria(index)}
                                />
                            )}
                        </Space>
                    ))}
                </div>

                <Space>
                    <Button size="large" type="primary" onClick={addCriteria} icon={<FaPlus />}>
                        Thêm điều kiện
                    </Button>

                    <Button size="large" onClick={resetCriteria} icon={<FaRetweet />}>
                        Thiết lập lại
                    </Button>

                    <Button size="large" type="primary" htmlType="submit" icon={<FaSearch />}>
                        Tìm kiếm
                    </Button>
                </Space>
            </form>
        </>
    );
}

export default AdvancedSearchForm;
