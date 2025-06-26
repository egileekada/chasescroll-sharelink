import Yup from 'yup';

const accountCreationSchema = Yup.object({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email').required('Email is required')
})

export {
    accountCreationSchema
}