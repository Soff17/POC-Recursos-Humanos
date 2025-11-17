import React, { useEffect } from 'react';
import { Box, Typography, Grid, AppBar, Toolbar, Chip } from '@mui/material';
import {
  Security,
  Psychology,
  Assessment,
  IntegrationInstructions,
  Shield,
  LocationOn,
  Language
} from '@mui/icons-material';
import Image from 'next/image';

const technologies = [
    { name: 'watsonx.ai', link: 'https://www.ibm.com/es-es/products/watsonx-ai' },
    { name: 'watsonx.orchestrate', link: 'https://www.ibm.com/products/watsonx-orchestrate' },
    { name: 'watson.discovery', link: 'https://www.ibm.com/es-es/products/watson-discovery' },
    { name: 'watsonx.governance', link: 'https://www.ibm.com/es-es/products/watsonx-governance' }
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
            text: 'orquestador'
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

  const cardStyle = {
    bgcolor: '#1e3a5f',
    borderRadius: '20px',
    p: 3,
    height: '100%',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(30, 58, 95, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header Institucional */}
      <AppBar position="sticky" sx={{ backgroundColor: '#1e3a5f', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Shield sx={{ fontSize: 40, color: '#fff' }} />
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', letterSpacing: '0.5px' }}>
                Talent Hub
              </Typography>
              <Typography variant="caption" sx={{ color: '#b0c4de' }}>
                España
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            <Chip
              icon={<Security sx={{ color: '#fff !important' }} />}
              label="Sistema Seguro"
              sx={{ backgroundColor: '#215aa4', color: '#fff', fontWeight: 600 }}
            />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Botón flotante Watson Assistant */}
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
          background: 'linear-gradient(135deg, #215aa4, #1e3a5f)',
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
        <Box sx={{ fontSize: 28 }}><Image src="/logos/bot.png" alt="Asistente Talent Hub" width={100} height={100} /></Box>
      </Box>

      <Box>
        {/* Hero Section */}
        <Box sx={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #215aa4 100%)',
          py: 8,
          px: 4,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Typography variant="h2" fontWeight={800} sx={{ color: '#fff', mb: 2, letterSpacing: '1px' }}>
            Sistema Inteligente de Gestión de Talento
          </Typography>
          <Typography variant="h5" sx={{ color: '#b0c4de', mb: 5, fontWeight: 300 }}>
            Selección automatizada de personal técnico y militar
          </Typography>

          {/* Estadísticas */}
          <Grid container spacing={3} sx={{ maxWidth: '900px', margin: '0 auto' }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', p: 3, backdropFilter: 'blur(10px)' }}>
                <Typography variant="h3" fontWeight={800} sx={{ color: '#fff' }}>
                  756
                </Typography>
                <Typography variant="body1" sx={{ color: '#b0c4de' }}>
                  CVs Analizados
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', p: 3, backdropFilter: 'blur(10px)' }}>
                <Typography variant="h3" fontWeight={800} sx={{ color: '#fff' }}>
                  10
                </Typography>
                <Typography variant="body1" sx={{ color: '#b0c4de' }}>
                  Candidatos Preseleccionados
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', p: 3, backdropFilter: 'blur(10px)' }}>
                <Typography variant="h3" fontWeight={800} sx={{ color: '#fff' }}>
                  3
                </Typography>
                <Typography variant="body1" sx={{ color: '#b0c4de' }}>
                  Mejores Candidatos
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Contenido Principal */}
        <Box sx={{ px: 4, py: 6 }}>
        <Grid container spacing={3}>
          {/* Capacidades del Sistema */}
          <Grid item xs={12} md={9}>
            <Box sx={{ ...cardStyle, backgroundColor: '#fff', color: '#1e3a5f' }}>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 5 }}>
                Capacidades del Sistema
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 3 }}>
                    <Security sx={{ fontSize: 32, color: '#215aa4' }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>Análisis de Seguridad</Typography>
                      <Typography variant="body2" sx={{ color: '#5b7691' }}>
                        Verificación automática de acreditaciones y habilitaciones de seguridad
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 3 }}>
                    <Psychology sx={{ fontSize: 32, color: '#215aa4' }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>IA Especializada</Typography>
                      <Typography variant="body2" sx={{ color: '#5b7691' }}>
                        Algoritmos adaptados para perfiles técnico-militares
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 3 }}>
                    <Assessment sx={{ fontSize: 32, color: '#215aa4' }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>Evaluación de Competencias</Typography>
                      <Typography variant="body2" sx={{ color: '#5b7691' }}>
                        Análisis profundo de habilidades en ciberseguridad y TIC
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 3 }}>
                    <IntegrationInstructions sx={{ fontSize: 32, color: '#215aa4' }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>Gestión Automatizada</Typography>
                      <Typography variant="body2" sx={{ color: '#5b7691' }}>
                        Generación automática de convocatorias y publicaciones
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Tecnologías */}
          <Grid item xs={12} md={3}>
            <Box sx={{ ...cardStyle, backgroundColor: '#fff', color: '#1e3a5f' }}>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
                Tecnologías
              </Typography>
              <Grid container spacing={2}>
                {technologies.map((tech, index) => {
                  const colors = ['#1e3a5f', '#215aa4', '#3a4f66', '#5b7691'];
                  return (
                    <Grid item xs={6} key={index}>
                      <Box
                        component="button"
                        onClick={() => window.open(tech.link, '_blank')}
                        sx={{
                          width: '100%',
                          aspectRatio: '1 / 1',
                          background: colors[index % colors.length],
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 2,
                          transition: 'all 0.3s ease',
                          border: '2px solid transparent',
                          cursor: 'pointer',
                          outline: 'none',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            borderColor: '#fff',
                            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                          },
                          '&:active': {
                            transform: 'scale(0.98)',
                          },
                          '&:focus': {
                            borderColor: '#fff',
                            boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.3)',
                          }
                        }}
                      >
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          sx={{
                            color: '#fff',
                            textAlign: 'center',
                            fontSize: { xs: '0.85rem', md: '0.95rem' }
                          }}
                        >
                          {tech.name}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Grid>

          {/* Video Demo */}
          <Grid item xs={12} md={9}>
            <Box
              sx={{
                ...cardStyle,
                position: 'relative',
                overflow: 'hidden',
                p: 0,
                backgroundColor: '#fff',
                height: '400px'
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
                  objectFit: 'cover',
                  zIndex: 0,
                }}
              >
                <source src="/logos/demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </Box>
          </Grid>

          {/* Partners */}
          <Grid item xs={12} md={3}>
            <Box sx={{ ...cardStyle, backgroundColor: '#fff', color: '#1e3a5f', gap: 2 }}>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                Impulsado por
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ backgroundColor: '#1e3a5f', borderRadius: '12px', p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Image src="/logos/ibm.png" alt="IBM" width={120} height={50} />
                </Box>
                <Box sx={{ backgroundColor: '#f5f5f5', borderRadius: '12px', p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Image src="/logos/kp.png" alt="Knowledge Partner" width={120} height={100} />
                </Box>
              </Box>
            </Box>
          </Grid>

        </Grid>
        </Box>

        {/* Footer Institucional */}
        <Box sx={{
          backgroundColor: '#1e3a5f',
          color: '#fff',
          py: 6,
          px: 4,
          mt: 8
        }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Shield sx={{ fontSize: 40 }} />
                <Typography variant="h6" fontWeight={700}>Talent HUB</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#b0c4de', mb: 2 }}>
                Centro de Sistemas y Tecnologías de la Información y las Comunicaciones
              </Typography>
              <Typography variant="caption" sx={{ color: '#b0c4de' }}>
                España
              </Typography>
            </Grid>

            <Grid item xs={12} md={5}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Contacto</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ fontSize: 20, color: '#b0c4de' }} />
                  <Typography variant="body2" sx={{ color: '#b0c4de' }}>Madrid, España</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
        </Box>
    </Box>
  );
};

export default CesticTalentHub;
