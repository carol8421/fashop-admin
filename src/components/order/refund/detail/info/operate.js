import React, { Component } from "react";
import { Button, Input, InputNumber, message ,Form} from "antd";
import styles from "../index.css";
import { View } from "@/components/flexView";
import { handle } from "@/models/refund";
import { connect } from "dva";
import router from "umi/router";

const TextArea = Input.TextArea;
const { Fragment } = React;

@connect()
export default class OrderDetailOperateInfo extends Component {
    static defaultProps = {
        dispatch: () => {
        }
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.id !== this.state.id) {
            this.setState({
                handle_message: nextProps.handle_message,
                refund_amount: nextProps.refund_amount
            });
        }
    }

    constructor(props) {
        super();
        this.state = {
            handle_message: props.handle_message,
            refund_amount: props.refund_amount
        };
    }

    render() {
        const { id, handle_state, dispatch, order_amount } = this.props;
        const { handle_message, refund_amount } = this.state;
        let maxRefundAmount = order_amount ? parseFloat(order_amount) : 0;
        return (
            <Fragment>
                {id > 0 ? <Fragment><View className={styles.infoWarp}>
                    <p className={styles.infoTitle}>同意退款</p>
                    <View className={styles.btnWarp}>
                        <Form.Item extra={`退款累计金额不得超过订单总金额 ${maxRefundAmount}元`}>
                            <InputNumber
                                style={{ width: 100 }}
                                formatter={value => `${value} 元`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                value={refund_amount}
                                max={maxRefundAmount}
                                min={0}
                                precision={2}
                                onChange={(value) => {
                                    this.setState({
                                        refund_amount: value
                                    });
                                }}
                            />
                        </Form.Item>

                    </View>
                </View>
                    <View className={styles.infoWarp}>
                        <p className={styles.infoTitle}>备注</p>
                        <View className={styles.btnWarp}>
                    <TextArea
                        placeholder="请输入备注"
                        autosize={{ minRows: 4, maxRows: 8 }}
                        value={handle_message}
                        disabled={handle_state !== 0}
                        onChange={(e) => {
                            this.setState({
                                handle_message: e.currentTarget.value
                            });
                        }}
                    />
                        </View>
                    </View></Fragment> : null}
                {/*卖家处理状态 默认0处理中(未处理) 10拒绝(驳回) 20同意 30成功(已完成) 50取消(用户主动撤销) 51取消(用户主动收货)*/}
                {handle_state === 0 ? <View className={styles.infoWarp}>
                    <p className={styles.infoTitle}>可执行操作</p>
                    <View className={styles.btnWarp}>
                        <Button
                            type='primary'
                            onClick={() => {
                                dispatch({
                                    type: "refund/handle",
                                    payload: { id, handle_state: 20, handle_message, refund_amount },
                                    callback: (response) => {
                                        if (response.code === 0) {
                                            message.success("操作成功");
                                            router.goBack();
                                        } else {
                                            message.error(response.msg);
                                        }
                                    }
                                });
                            }}
                        >
                            同意申请
                        </Button>

                        <Button
                            onClick={() => {
                                dispatch({
                                    type: "refund/handle",
                                    payload: { id, handle_state: 10, handle_message },
                                    callback: (response) => {
                                        if (response.code === 0) {
                                            message.success("操作成功");
                                            router.goBack();
                                        } else {
                                            message.error(response.msg);
                                        }
                                    }
                                });
                            }}
                        >
                            拒绝退款
                        </Button>
                    </View>
                </View> : null}
            </Fragment>
        );
    }
}
