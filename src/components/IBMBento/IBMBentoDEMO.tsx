import React, { useEffect, useState } from 'react'; // añade useState
import { Box, Typography, Grid, IconButton, Tooltip } from '@mui/material';
import { Launch } from '@mui/icons-material';
import Image from 'next/image';

const technologies = [
    { name: 'rag', img: '/logos/rag.png', link: '#' },
    { name: 'llm', img: '/logos/llm.png', link: '#' },
    { name: 'genai', img: '/logos/genAI.png', link: '#' }
];

interface WatsonAssistantReceiveEvent {
  data?: {
    output?: {
      generic?: Array<{
        response_type: string;
        text?: string;
        title?: string;
        options?: Array<{ label: string }>;
      }>;
    };
  };
}

interface ViewChangeEvent {
  newViewState: {
    mainWindow: boolean;
  };
}

interface WatsonChatInstance {
  changeView: (view: string) => void;
  restartConversation: (...args: unknown[]) => Promise<void>;
  send: (message: { input: { message_type: string; text: string } }, options: { silent: boolean }) => Promise<void>;
  on: (
    event: {
      type: 'view:change';
      handler: (e: ViewChangeEvent) => void;
    } | {
      type: 'receive';
      handler: (e: WatsonAssistantReceiveEvent) => void;
    }
  ) => void;
  updateLocale: (locale: string) => Promise<void>;
  render: () => Promise<void>;
}

interface WatsonChatOptions {
  integrationID: string;
  region: string;
  serviceInstanceID: string;
  headerConfig?: {
    minimizeButtonIconType?: string;
    showRestartButton?: boolean;
  };
  showLauncher?: boolean;
  layout?: {
    showFrame?: boolean;
  };
  onLoad?: (instance: WatsonChatInstance) => void;
}

declare global {
  interface Window {
    webChatInstance?: WatsonChatInstance;
    watsonAssistantChatOptions?: WatsonChatOptions;
  }
}

const CesticTalentHub = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    window.watsonAssistantChatOptions = {
      integrationID: '35cc817c-7c2f-4237-8040-ef0b5d33b098',
      region: 'wxo-au-syd',
      serviceInstanceID: '295771ac-d74d-4be7-a099-462113a456ac',
      headerConfig: {
        minimizeButtonIconType: 'close',
        showRestartButton: false
      },
      showLauncher: false,
      layout: {
        showFrame: false,
      },
      onLoad: async (instance: WatsonChatInstance) => {
        window.webChatInstance = instance;
  
        const invokeInitial = {
          input: {
            message_type: 'text',
            text: 'gobierno'
          }
        };
        const sendOptions = { silent: true };
  
        const originalRestart = instance.restartConversation.bind(instance);
  
        instance.restartConversation = async function (...args: unknown[]) {
          await originalRestart(...args);
          await instance.send(invokeInitial, sendOptions).catch(console.error);
        };
  
        instance.on({
          type: 'view:change',
          handler: (event: ViewChangeEvent) => {
            const launcherBtn = document.querySelector('.custom-launcher') as HTMLElement;
            if (launcherBtn) {
              launcherBtn.style.display = event.newViewState.mainWindow ? 'none' : '';
              window.dispatchEvent(new CustomEvent("watson-chat-open", { detail: event.newViewState.mainWindow }));
            }
          },
        });
  
        // Aquí escuchamos la respuesta y la mandamos por evento personalizado
        instance.on({
            type: 'receive',
            handler: (event: WatsonAssistantReceiveEvent) => {
              const messages = event.data?.output?.generic || [];
          
              let responseText = '';
          
              messages.forEach((msg) => {
                if (msg.response_type === 'text') {
                  responseText += msg.text + '\n';
                } else if (msg.response_type === 'option') {
                  responseText += msg.title + '\n';
                  msg.options?.forEach((opt) => {
                    responseText += `• ${opt.label}\n`;
                  });
                }
              });              
          
              window.dispatchEvent(new CustomEvent("watson-assistant-response", { detail: responseText }));
            }
          });          
  
        await instance.updateLocale('es');
        await instance.render();
        await instance.restartConversation();
      }
    };
  
    const script = document.createElement('script');
    script.src = 'https://web-chat.global.assistant.watson.appdomain.cloud/versions/latest/WatsonAssistantChatEntry.js';
    document.head.appendChild(script);
  }, []);  
  
  useEffect(() => {
    const listener = (e: CustomEvent) => {
      setIsChatOpen(e.detail);
    };
  
    window.addEventListener('watson-chat-open', listener as EventListener);
    return () => window.removeEventListener('watson-chat-open', listener as EventListener);
  }, []);  
  

  const cardStyle = {
    bgcolor: '#1e3a5f', // CESTIC navy
    borderRadius: '20px',
    p: 3,
    height: '100%',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(30, 58, 95, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };

  const chipStyle = {
    px: 2,
    py: 1,
    borderRadius: '16px',
    fontSize: '13px',
    backgroundColor: '#3a4f66', // CESTIC dark overlay
    color: '#fff',
    border: '1px solid #5b7691',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: '0.3s',
    '&:hover': {
      backgroundColor: '#5b7691', // CESTIC blue-gray
      boxShadow: '0 0 6px rgba(91, 118, 145, 0.3)',
    },
  };  

  return (
    <Box sx={{ backgroundColor: isChatOpen ? '#5b7691' : '#e8e8e8', minHeight: '100vh', px: 3, py: 6 }}>
      {/* Botón flotante personalizado para abrir Watson Assistant */}
      <Box
        className="custom-launcher"
        onClick={() => {
          window?.webChatInstance?.changeView('mainWindow');
        }}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #215aa4, #1e3a5f)', // CESTIC blue gradient
          color: '#fff',
          boxShadow: '0 8px 24px rgba(30, 58, 95, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-3px) scale(1.25)',
            boxShadow: '0 12px 28px rgba(33, 90, 164, 0.5)',
          },
        }}
      >
        <Box sx={{ fontSize: 28 }}><Image src="/logos/bot.png" alt="Asistente CESTIC RH" width={100} height={100} /></Box>
      </Box>

      {!isChatOpen && (
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} sx={{}}>
          <Box sx={{ ...cardStyle}} >
            <Typography variant="h2" fontWeight="bold">CESTIC Talent Hub</Typography>
            <Typography variant="body2">
              Sistema de gestión de talento diseñado para el personal de Recursos Humanos de CESTIC. Identifica candidatos cualificados para puestos técnicos y militares en tecnologías de la información, ciberseguridad y comunicaciones del Ministerio de Defensa.
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={2}>
          <Box sx={{ ...cardStyle, gap: 2, p: 0, backgroundColor: 'transparent', boxShadow: 'none' }}>
            <Box sx={{ ...cardStyle, alignItems: 'center', justifyContent: 'center', flex: 1, backgroundColor:'#e01288'}}>
              <Image src="/logos/nds.png" alt="NDS" width={140} height={100} />
            </Box>
            <Box sx={{ ...cardStyle, alignItems: 'center', justifyContent: 'center', flex: 1, backgroundColor:'white' }}>
              <Image src="/logos/kp.png" alt="IBM" width={120} height={120} />
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ ...cardStyle}} >
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>Tecnologías de IA Implementadas</Typography>
            <Grid container spacing={2} justifyContent="flex-start" sx={{paddingTop:5, paddingBottom:5}}>
                {technologies.map((tech, index) => (
                  <Grid item xs={6} sm={4} md={3} lg={4} key={index}>
                    <Tooltip title={tech.name} placement="top">
                      <Box
                        sx={{
                          width: '100%',
                          aspectRatio: '1 / 1',
                          background: '#3a4f66', // CESTIC dark overlay
                          borderRadius: '20px',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 2,
                          transition: '0.3s ease',
                          boxShadow: '0 0 10px rgba(30, 58, 95, 0.3)',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: '0 0 15px rgba(91, 118, 145, 0.4)',
                          },
                        }}
                      >
                        <Box
                          component="img"
                          src={tech.img}
                          alt={tech.name}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      </Box>
                    </Tooltip>
                  </Grid>              
                ))}
            </Grid>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ ...cardStyle}}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
              Capacidades del Sistema
            </Typography>
            <Typography variant="body2" sx={{ color: '#ccc', mb: 3 }}>
              Plataforma de IA avanzada para la selección de personal técnico especializado en defensa, ciberseguridad y sistemas de información críticos.
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              <Box sx={{ ...chipStyle}}>🔒 Análisis de perfiles con acreditación de seguridad</Box>
              <Box sx={{ ...chipStyle}}>🎯 IA especializada en talento técnico-militar</Box>
              <Box sx={{ ...chipStyle}}>📊 Evaluación de competencias en ciberseguridad</Box>
              <Box sx={{ ...chipStyle}}>✉️ Gestión automatizada de convocatorias</Box>
              <Box sx={{ ...chipStyle}}>🔗 Integración con sistemas del Ministerio</Box>
            </Box>

            <IconButton href="#" sx={{ mt: 3, alignSelf: 'flex-end' }}>
              <Launch sx={{ color: '#fff' }} />
            </IconButton>
          </Box>
        </Grid>

        <Grid item xs={12} md={8}>
  <Box
    sx={{
      ...cardStyle,
      position: 'relative',
      overflow: 'hidden', 
      p: 0, // sin padding para que el video se ajuste al 100%
    }}
  >
    <video
      autoPlay
      loop
      muted
      playsInline
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'fill', // aquí se hace el "cover"
        zIndex: 0,
        transform: 'scale(1.1)', // zoom sutil
        transition: 'transform 0.5s ease-in-out',
      }}
    >
      <source src="/logos/demo.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  </Box>
</Grid>


        <Grid item xs={12} md={4}>
          <Box sx={{ ...cardStyle}}>
            <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Selección inteligente para Defensa Nacional
            </Typography>
          </Box>
        </Grid>


        <Grid item xs={12} md={2}>
          <Box
            sx={{
              ...cardStyle,
              backgroundColor: '#215aa4', // CESTIC button blue
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image src="/logos/bot.png" alt="CESTIC Talent Hub" width={200} height={170} />
          </Box>
        </Grid>

        <Grid item xs={12} md={6} sx={{}}>
          <Box sx={{ ...cardStyle}} >
            <Typography variant="h4" fontWeight="bold">Candidatos Preseleccionados</Typography>
            <Typography variant="body2">
              Resultados de la selección basada en IA especializada para CESTIC. Análisis exhaustivo de perfiles técnicos con evaluación de competencias en sistemas TIC, ciberseguridad y cumplimiento de requisitos de seguridad nacional.
            </Typography>
          </Box>
        </Grid>

      </Grid>
      )}
    </Box>
  );
};

export default CesticTalentHub;