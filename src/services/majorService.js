import { axiosPrivate } from '~/apis/configHttp';

export const getMajorById = (id) => {
  return axiosPrivate.get(`majors/${id}`).then(res => res.data);
};

export const getAllMajors = (params) => {
  return axiosPrivate.get(`majors?${params}`).then(res => res.data);
};

export const createMajor = (values) => {
  return axiosPrivate.post('majors', values);
};

export const updateMajor = (id, values) => {
  return axiosPrivate.put(`majors/${id}`, values);
};

export const deleteMajor = (id) => {
  return axiosPrivate.delete(`majors/${id}`);
};

export const toggleMajorActiveStatus = (id) => {
  return axiosPrivate.patch(`majors/${id}/toggle-active`);
};
