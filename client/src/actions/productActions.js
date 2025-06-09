import axios from 'axios';
import { productListRequest, productListSuccess, productListFail } from '../redux/reducers/productReducer';

export const listProducts = () => async (dispatch) => {
  try {
    dispatch(productListRequest());

    const { data } = await axios.get('http://localhost:5000/api/products');

    dispatch(productListSuccess(data));
  } catch (error) {
    dispatch(
      productListFail(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      )
    );
  }
};

export const listProductDetails = (id) => async (dispatch) => {
  try {
    dispatch(productListRequest());

    const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);

    dispatch(productListSuccess(data));
  } catch (error) {
    dispatch(
      productListFail(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      )
    );
  }
}; 