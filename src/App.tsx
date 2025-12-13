import { useEffect, useRef, useState } from 'react';
import './App.less';

import { VideoCoreSDK } from './videoCoreSDK.es.min.js';
import { data } from './data';
import { Slider, Space } from '@douyinfe/semi-ui';
import { effectData } from './effectData';

// 开发模式下直接加载js文件，生产模式下使用 txt 文件
(window as any).EModuleEffectSourcePathDEV = true;

function App() {
  const videoCoreRef = useRef<any>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    // 确保只创建一次实例
    if (!videoCoreRef.current) {
      const vc = new VideoCoreSDK({
        data: data, // 必填，工程数据
        target: document.getElementById('video-container')!, // 必填，渲染目标
        movieId: 'movieID', // 实例内部唯一标识，多个实例不能相同
        env: 'preview', // 必填，渲染模式：editor（编辑模式，可拖动编辑）； preview（预览模式，只能预览，内存消耗更小）
        registerId: 'H5DS', // 必填，注册ID，和域名进行绑定的
        resourceHost: 'https://cdn.h5ds.com',
        EModuleEffectSourcePath: '/assets/effectcanvas/', // 特效资源模块加载路径
        workerPath: 'assets', // 选填，decode.worker.js的引用目录，默认是assets
        stopControl: true, // 停止使用控制器，默认是启用了控制器
        scale: 0.5, // 选填，画布缩放比例，默认是1
        currentTime: 0, // 选填，默认开始时间是0
        plugins: [], // 选填，扩展插件
        triggerCurrentTime: (currentTime: number) => {
          setCurrentTime(currentTime);
        },
      });
      vc.init().then((core: any) => {
        videoCoreRef.current = core;
        console.log('>>>>>', videoCoreRef.current, core.getTotalTime());
        setDuration(core.getTotalTime());
      });
    }

    // 清理函数，在组件卸载时销毁实例
    return () => {
      if (videoCoreRef.current) {
        // 调用VideoCoreSDK的销毁方法（如果有的话）
        // videoCoreRef.current.destroy();
        videoCoreRef.current = null;
      }
    };
  }, []);

  const addEffect = (d: Object) => {
    videoCoreRef.current?.addElementNoSource(
      {
        ...d,
      },
      {
        time: 0,
        elementType: 'effect',
        duration: 9,
      },
    );
    videoCoreRef.current?.update();
  };

  return (
    <div
      style={{
        width: '960px',
      }}
    >
      <div id="video-container"></div>
      <div>
        {!!duration && (
          <Slider
            value={currentTime}
            max={duration}
            step={0.01}
            onChange={value => videoCoreRef.current?.triggerCurrentTime(value)}
          />
        )}
      </div>
      <div className="list">
        <a
          onClick={() => {
            videoCoreRef.current?.play();
          }}
        >
          play
        </a>
        <a
          onClick={() => {
            videoCoreRef.current?.pause();
          }}
        >
          pause
        </a>
        <a
          onClick={() => {
            videoCoreRef.current!.data.elements = videoCoreRef.current?.data.elements.filter((d: { type: string; }) => d.type !== 'effect');
            videoCoreRef.current?.update();
          }}
        >
          clear
        </a>
        {effectData.map(d => {
          return (
            <a
              onClick={() => {
                addEffect(d);
              }}
              key={d.jscript}
            >
              {d.name}
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default App;
